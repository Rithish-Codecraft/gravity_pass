"""
routes/analytics.py
====================
Student Performance Analytics endpoints:

  GET  /ml/analytics/student/<id>  — full performance profile + ML prediction
  GET  /ml/analytics/class         — class-level summary
  POST /ml/analytics/marks         — enter/update internal marks
  GET  /ml/analytics/risk          — list at-risk students
  GET  /ml/analytics/toppers       — top performers
  GET  /ml/analytics/backlog       — backlog list with severity
"""

from flask import Blueprint, request, jsonify
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from database import query, execute
import ml.performance_model as perf_model

bp = Blueprint('analytics', __name__)


@bp.route('/analytics/student/<int:student_id>', methods=['GET'])
def student_analytics(student_id):
    """Full performance profile for one student."""
    # Core student info
    profile = query("""
        SELECT u.name, u.email, u.dept, s.roll_no, s.cgpa, s.semester, s.rank
        FROM students s JOIN users u ON u.id=s.user_id
        WHERE s.id=?
    """, (student_id,), one=True)

    if not profile:
        return jsonify({'error': 'Student not found'}), 404

    # Results per semester
    results = query("""
        SELECT semester, subject, grade, internal, external
        FROM results WHERE student_id=?
        ORDER BY semester, subject
    """, (student_id,))

    # Compute averages
    internal_avg = (sum(r['internal'] for r in results) / len(results)) if results else 0
    external_avg = (sum(r['external'] for r in results) / len(results)) if results else 0
    backlog_count = len([r for r in results if r['grade'] in ('D', 'F', None)])

    # Attendance %
    att_row = query("""
        SELECT ROUND(100.0*SUM(CASE WHEN status='present' THEN 1 ELSE 0 END)/MAX(COUNT(*),1),1) as pct
        FROM attendance WHERE student_id=?
    """, (student_id,), one=True)
    attendance_pct = att_row['pct'] if att_row and att_row['pct'] else 80.0

    # SGPA per semester
    sgpa_map = {}
    for r in results:
        if r['semester'] not in sgpa_map:
            sgpa_map[r['semester']] = []
        sgpa_map[r['semester']].append(r['internal'] / 25 * 4 + r['external'] / 75 * 6)
    sgpa_list = [{'semester': sem, 'sgpa': round(sum(v)/len(v), 2)} for sem, v in sorted(sgpa_map.items())]

    # ML prediction
    prediction = perf_model.predict(
        internal_avg   = internal_avg,
        external_avg   = external_avg,
        attendance_pct = attendance_pct,
        backlog_count  = backlog_count,
        cgpa           = profile['cgpa'] or 7.5,
        semester       = profile['semester'] or 4,
    )

    # Persist prediction
    execute("""
        INSERT INTO ml_performance (student_id, internal_avg, external_avg,
            backlog_count, attendance_pct, pass_prob, risk_level)
        VALUES (?,?,?,?,?,?,?)
        ON CONFLICT(student_id) DO UPDATE SET
            internal_avg=excluded.internal_avg, external_avg=excluded.external_avg,
            backlog_count=excluded.backlog_count, attendance_pct=excluded.attendance_pct,
            pass_prob=excluded.pass_prob, risk_level=excluded.risk_level,
            updated_at=datetime('now')
    """, (student_id, internal_avg, external_avg, backlog_count, attendance_pct,
          prediction['pass_probability'], prediction['risk_level']))

    return jsonify({
        'profile':        profile,
        'results':        results,
        'sgpa_trend':     sgpa_list,
        'averages':       {'internal': round(internal_avg,2), 'external': round(external_avg,2)},
        'attendance_pct': attendance_pct,
        'backlog_count':  backlog_count,
        'prediction':     prediction,
    })


@bp.route('/analytics/class', methods=['GET'])
def class_analytics():
    """Department-level performance summary."""
    dept = request.args.get('dept', '')

    rows = query("""
        SELECT
            u.dept,
            COUNT(DISTINCT s.id) as total_students,
            ROUND(AVG(s.cgpa),2) as avg_cgpa,
            ROUND(AVG(CASE WHEN a.status='present' THEN 100.0 ELSE 0 END),1) as avg_attendance,
            COUNT(CASE WHEN mp.risk_level='High' THEN 1 END) as high_risk_count,
            COUNT(CASE WHEN mp.risk_level='Low'  THEN 1 END) as low_risk_count
        FROM students s
        JOIN users u ON u.id=s.user_id
        LEFT JOIN attendance  a  ON a.student_id=s.id
        LEFT JOIN ml_performance mp ON mp.student_id=s.id
        WHERE (?='' OR u.dept=?)
        GROUP BY u.dept
        ORDER BY avg_cgpa DESC
    """, (dept, dept))

    return jsonify({'departments': rows, 'count': len(rows)})


@bp.route('/analytics/marks', methods=['POST'])
def enter_marks():
    """
    Enter or update internal marks for a student.
    Body: { student_id, subject, semester, internal, external, grade }
    """
    data = request.get_json()
    required = ['student_id', 'subject', 'semester', 'internal', 'external']
    for f in required:
        if f not in data:
            return jsonify({'error': f'{f} required'}), 400

    grade = data.get('grade', _compute_grade(data['external']))

    execute("""
        INSERT INTO results (student_id, subject, semester, internal, external, grade)
        VALUES (?,?,?,?,?,?)
        ON CONFLICT DO NOTHING
    """, (data['student_id'], data['subject'], data['semester'],
          data['internal'], data['external'], grade))

    return jsonify({'message': 'Marks saved', 'grade': grade})


def _compute_grade(external: float) -> str:
    if external >= 90: return 'O'
    if external >= 80: return 'A+'
    if external >= 70: return 'A'
    if external >= 60: return 'B+'
    if external >= 50: return 'B'
    if external >= 45: return 'C'
    if external >= 40: return 'P'
    return 'F'


@bp.route('/analytics/risk', methods=['GET'])
def at_risk():
    """Return list of at-risk students (High or Medium risk)."""
    level = request.args.get('level', 'High')
    rows  = query("""
        SELECT u.name, s.roll_no, u.dept, s.cgpa, mp.attendance_pct,
               mp.backlog_count, mp.pass_prob, mp.risk_level
        FROM ml_performance mp
        JOIN students s ON s.id=mp.student_id
        JOIN users    u ON u.id=s.user_id
        WHERE mp.risk_level=?
        ORDER BY mp.pass_prob ASC
    """, (level,))
    return jsonify({'at_risk': rows, 'count': len(rows)})


@bp.route('/analytics/toppers', methods=['GET'])
def toppers():
    """Return top N performing students."""
    n    = request.args.get('n', 10, type=int)
    dept = request.args.get('dept', '')
    rows = query("""
        SELECT u.name, s.roll_no, u.dept, s.cgpa, s.rank, s.semester
        FROM students s JOIN users u ON u.id=s.user_id
        WHERE (?='' OR u.dept=?)
        ORDER BY s.cgpa DESC, s.rank ASC
        LIMIT ?
    """, (dept, dept, n))
    return jsonify({'toppers': rows})


@bp.route('/analytics/backlog', methods=['GET'])
def backlogs():
    """List students with backlogs and their severity."""
    dept = request.args.get('dept', '')
    rows = query("""
        SELECT u.name, s.roll_no, u.dept,
               COUNT(r.id) as backlog_count,
               GROUP_CONCAT(r.subject, ', ') as backlog_subjects
        FROM results r
        JOIN students s ON s.id=r.student_id
        JOIN users    u ON u.id=s.user_id
        WHERE r.grade IN ('F','D') AND (?='' OR u.dept=?)
        GROUP BY r.student_id
        ORDER BY backlog_count DESC
    """, (dept, dept))
    return jsonify({'backlogs': rows, 'total': len(rows)})
