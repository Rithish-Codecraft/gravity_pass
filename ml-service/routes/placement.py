"""
routes/placement.py
===================
Placement Prediction & Resume Analysis endpoints:

  POST /ml/placement/predict       — predict placement probability
  POST /ml/placement/resume        — analyse resume text with NLP
  GET  /ml/placement/companies     — company-wise placement stats
  POST /ml/placement/record        — record a placement
  GET  /ml/placement/leaderboard   — students sorted by placement probability
"""

from flask import Blueprint, request, jsonify
import sys, os, json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from database import query, execute
import ml.placement_model as placement_model

bp = Blueprint('placement', __name__)


@bp.route('/placement/predict', methods=['POST'])
def predict():
    """
    Predict placement probability for a student.
    Body JSON:
      { student_id (optional), cgpa, internship_count, project_count,
        skills (list or count), communication_score, backlog_count, attendance_pct }
    """
    data = request.get_json()
    if not data:
        return jsonify({'error': 'JSON body required'}), 400

    # If student_id provided, auto-fill missing fields from DB
    sid = data.get('student_id')
    if sid:
        row = query("""
            SELECT s.cgpa, s.semester,
                   COALESCE(mp.attendance_pct, 80.0) as attendance_pct,
                   COALESCE(mp.backlog_count, 0)     as backlog_count,
                   COALESCE(mp.pass_prob, 0.7)       as pass_prob
            FROM students s
            LEFT JOIN ml_performance mp ON mp.student_id=s.id
            WHERE s.id=?
        """, (sid,), one=True)
        if row:
            data.setdefault('cgpa',           row['cgpa'])
            data.setdefault('attendance_pct', row['attendance_pct'])
            data.setdefault('backlog_count',  row['backlog_count'])

    skills = data.get('skills', [])
    skills_count = len(skills) if isinstance(skills, list) else int(skills)

    result = placement_model.predict(
        cgpa                = float(data.get('cgpa', 7.5)),
        internship_count    = int(data.get('internship_count', 0)),
        project_count       = int(data.get('project_count', 1)),
        skills_count        = skills_count,
        communication_score = float(data.get('communication_score', 6)),
        backlog_count       = int(data.get('backlog_count', 0)),
        attendance_pct      = float(data.get('attendance_pct', 80)),
    )

    # Persist probability if student_id given
    if sid:
        execute("""
            INSERT INTO ml_performance (student_id, placement_prob)
            VALUES (?,?)
            ON CONFLICT(student_id) DO UPDATE SET
                placement_prob=excluded.placement_prob, updated_at=datetime('now')
        """, (sid, result['placement_probability']))

    # Give actionable tips based on result
    tips = _generate_tips(
        float(data.get('cgpa', 7.5)),
        int(data.get('internship_count', 0)),
        int(data.get('project_count', 1)),
        skills_count,
        float(data.get('attendance_pct', 80)),
        int(data.get('backlog_count', 0)),
    )
    result['improvement_tips'] = tips
    return jsonify(result)


def _generate_tips(cgpa, internships, projects, skills, attendance, backlogs) -> list:
    tips = []
    if cgpa < 7.0:
        tips.append('Focus on improving CGPA — target 7.5+ for better shortlisting')
    if internships < 1:
        tips.append('Complete at least 1 internship — it significantly boosts placement probability')
    if projects < 2:
        tips.append('Build 2–3 projects on GitHub to showcase practical skills')
    if skills < 5:
        tips.append('Add more technical skills: Python, SQL, ML, React, Cloud (AWS/Azure)')
    if attendance < 75:
        tips.append('Maintain 75%+ attendance — many companies check academic records')
    if backlogs > 0:
        tips.append(f'Clear your {backlogs} backlog(s) — some companies filter on this')
    if not tips:
        tips.append('Great profile! Focus on DSA practice and mock interviews')
    return tips


@bp.route('/placement/resume', methods=['POST'])
def resume_analyse():
    """
    Analyse resume text using NLP keyword extraction.
    Body: { text: "resume content...", student_id: optional }
    """
    data = request.get_json()
    text = data.get('text', '')
    if not text:
        return jsonify({'error': 'text required'}), 400

    result  = placement_model.analyze_resume(text)
    sid     = data.get('student_id')

    if sid:
        execute("""
            INSERT INTO resume_analyses (student_id, keywords, score)
            VALUES (?,?,?)
        """, (sid, json.dumps(result['all_keywords']), result['keyword_score']))

    return jsonify(result)


@bp.route('/placement/companies', methods=['GET'])
def companies():
    """Company-wise placement statistics from the placements table."""
    rows = query("""
        SELECT company,
               COUNT(*)           as placements,
               ROUND(AVG(package),2) as avg_package_lpa,
               MAX(package)       as max_package_lpa,
               MIN(package)       as min_package_lpa
        FROM placements
        GROUP BY company
        ORDER BY placements DESC
    """)
    total = query("SELECT COUNT(*) as cnt FROM placements", one=True)['cnt']
    total_students = query("SELECT COUNT(*) as cnt FROM students", one=True)['cnt']
    return jsonify({
        'companies':      rows,
        'total_placed':   total,
        'total_students': total_students,
        'placement_rate': round(total / max(total_students, 1) * 100, 1),
    })


@bp.route('/placement/record', methods=['POST'])
def record_placement():
    """Record a new placement event."""
    data = request.get_json()
    for f in ['student_id', 'company', 'package', 'role']:
        if f not in data:
            return jsonify({'error': f'{f} required'}), 400

    row_id = execute("""
        INSERT INTO placements (student_id, company, package, role)
        VALUES (?,?,?,?)
    """, (data['student_id'], data['company'], data['package'], data['role']))

    return jsonify({'message': 'Placement recorded', 'id': row_id}), 201


@bp.route('/placement/leaderboard', methods=['GET'])
def leaderboard():
    """Students ranked by placement probability."""
    dept = request.args.get('dept', '')
    n    = request.args.get('n', 20, type=int)
    rows = query("""
        SELECT u.name, s.roll_no, u.dept, s.cgpa,
               COALESCE(mp.placement_prob, 0.5) as placement_prob,
               COALESCE(mp.risk_level, 'Medium') as risk_level
        FROM students s
        JOIN users u ON u.id=s.user_id
        LEFT JOIN ml_performance mp ON mp.student_id=s.id
        WHERE (?='' OR u.dept=?)
        ORDER BY placement_prob DESC
        LIMIT ?
    """, (dept, dept, n))
    return jsonify({'leaderboard': rows})
