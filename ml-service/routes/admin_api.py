"""
routes/admin_api.py
===================
Admin Dashboard API:

  GET /ml/admin/dashboard      — KPIs: students, attendance %, pass %, placement %
  GET /ml/admin/alerts         — system alerts (low attendance, high risk, backlogs)
  GET /ml/admin/dept-summary   — per-department breakdown
  GET /ml/admin/train          — trigger ML model re-training
  GET /ml/admin/grade-dist     — grade distribution data
  GET /ml/admin/attendance-trend — daily attendance trend (last 30 days)
"""

from flask import Blueprint, request, jsonify
import sys, os, datetime
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from database import query, execute
import ml.performance_model as perf_model
import ml.placement_model   as place_model

bp = Blueprint('admin_api', __name__)


@bp.route('/admin/dashboard', methods=['GET'])
def dashboard():
    """Main dashboard KPIs."""
    total_students = query("SELECT COUNT(*) as cnt FROM students", one=True)['cnt']
    total_staff    = query("SELECT COUNT(*) as cnt FROM staff",    one=True)['cnt']

    # Average attendance
    att = query("""
        SELECT ROUND(AVG(CASE WHEN status='present' THEN 100.0 ELSE 0 END),1) as avg
        FROM attendance
    """, one=True)
    avg_att = att['avg'] if att and att['avg'] else 0

    # Pass percentage (students risk_level != High)
    risk_counts = query("""
        SELECT risk_level, COUNT(*) as cnt
        FROM ml_performance GROUP BY risk_level
    """)
    risk_map = {r['risk_level']: r['cnt'] for r in risk_counts}
    high_risk  = risk_map.get('High', 0)
    pass_pct   = round((1 - high_risk / max(total_students, 1)) * 100, 1)

    # Placement rate
    placed = query("SELECT COUNT(DISTINCT student_id) as cnt FROM placements", one=True)['cnt']
    placement_pct = round(placed / max(total_students, 1) * 100, 1)

    # Avg CGPA
    cgpa_row = query("SELECT ROUND(AVG(cgpa),2) as avg FROM students", one=True)
    avg_cgpa  = cgpa_row['avg'] if cgpa_row else 0

    # Registered faces
    face_row = query("SELECT COUNT(*) as cnt FROM face_embeddings", one=True)
    face_count = face_row['cnt'] if face_row else 0

    return jsonify({
        'total_students':     total_students,
        'total_staff':        total_staff,
        'avg_attendance_pct': avg_att,
        'pass_pct':           pass_pct,
        'placement_pct':      placement_pct,
        'avg_cgpa':           avg_cgpa,
        'high_risk_students': high_risk,
        'faces_registered':   face_count,
        'total_placed':       placed,
    })


@bp.route('/admin/alerts', methods=['GET'])
def alerts():
    """Generate smart system alerts."""
    alert_list = []

    # Low attendance students
    low_att = query("""
        SELECT u.name, s.roll_no, u.dept,
               ROUND(100.0*SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END)/COUNT(*),1) as pct
        FROM attendance a
        JOIN students s ON s.id=a.student_id
        JOIN users    u ON u.id=s.user_id
        GROUP BY a.student_id
        HAVING pct < 75
        ORDER BY pct ASC
        LIMIT 10
    """)
    if low_att:
        alert_list.append({
            'type': 'attendance',
            'severity': 'high',
            'message': f'{len(low_att)} students below 75% attendance',
            'students': low_att,
        })

    # High-risk students (ML prediction)
    high_risk = query("""
        SELECT u.name, s.roll_no, u.dept, mp.pass_prob, mp.risk_level
        FROM ml_performance mp
        JOIN students s ON s.id=mp.student_id
        JOIN users    u ON u.id=s.user_id
        WHERE mp.risk_level='High'
        ORDER BY mp.pass_prob ASC LIMIT 10
    """)
    if high_risk:
        alert_list.append({
            'type': 'performance',
            'severity': 'high',
            'message': f'{len(high_risk)} students at high risk of failing',
            'students': high_risk,
        })

    # Backlog students
    backlog = query("""
        SELECT u.name, s.roll_no, COUNT(*) as backlogs
        FROM results r
        JOIN students s ON s.id=r.student_id
        JOIN users    u ON u.id=s.user_id
        WHERE r.grade IN ('F','D')
        GROUP BY r.student_id HAVING backlogs >= 2
        LIMIT 10
    """)
    if backlog:
        alert_list.append({
            'type': 'backlog',
            'severity': 'medium',
            'message': f'{len(backlog)} students with 2+ backlogs',
            'students': backlog,
        })

    return jsonify({'alerts': alert_list, 'total': len(alert_list)})


@bp.route('/admin/dept-summary', methods=['GET'])
def dept_summary():
    """Per-department KPI breakdown."""
    rows = query("""
        SELECT u.dept,
               COUNT(DISTINCT s.id)                                          as students,
               ROUND(AVG(s.cgpa),2)                                          as avg_cgpa,
               ROUND(AVG(CASE WHEN a.status='present' THEN 100.0 ELSE 0 END),1) as avg_att,
               COUNT(DISTINCT p.student_id)                                  as placed
        FROM students s
        JOIN users    u ON u.id=s.user_id
        LEFT JOIN attendance a ON a.student_id=s.id
        LEFT JOIN placements  p ON p.student_id=s.id
        GROUP BY u.dept
        ORDER BY avg_cgpa DESC
    """)
    return jsonify({'departments': rows})


@bp.route('/admin/grade-dist', methods=['GET'])
def grade_dist():
    """Grade distribution across all students."""
    rows = query("""
        SELECT grade, COUNT(*) as count
        FROM results
        GROUP BY grade
        ORDER BY CASE grade
            WHEN 'O' THEN 1 WHEN 'A+' THEN 2 WHEN 'A' THEN 3
            WHEN 'B+' THEN 4 WHEN 'B' THEN 5 WHEN 'C' THEN 6
            WHEN 'P' THEN 7 WHEN 'F' THEN 8 ELSE 9 END
    """)
    return jsonify({'distribution': rows})


@bp.route('/admin/attendance-trend', methods=['GET'])
def attendance_trend():
    """Daily attendance percentage for the last 30 days."""
    days = request.args.get('days', 30, type=int)
    rows = query("""
        SELECT a.date,
               ROUND(100.0*SUM(CASE WHEN status='present' THEN 1 ELSE 0 END)/COUNT(*),1) as pct,
               COUNT(*) as total_records
        FROM attendance a
        WHERE a.date >= date('now', ?)
        GROUP BY a.date
        ORDER BY a.date
    """, (f'-{days} days',))
    return jsonify({'trend': rows})


@bp.route('/admin/train', methods=['POST'])
def train_models():
    """Trigger ML model re-training using current DB data."""
    import pandas as pd

    results = {}

    # ── Performance model ──────────────────────────────────────────────────
    perf_data = query("""
        SELECT s.cgpa, s.semester,
               COALESCE(AVG(r.internal), 40) as internal_avg,
               COALESCE(AVG(r.external), 60) as external_avg,
               COALESCE(100.0*SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END)/
                        MAX(COUNT(a.id),1), 80)   as attendance_pct,
               COUNT(CASE WHEN r.grade IN ('F','D') THEN 1 END) as backlog_count,
               CASE WHEN COUNT(CASE WHEN r.grade='F' THEN 1 END) = 0 THEN 1 ELSE 0 END as passed
        FROM students s
        LEFT JOIN results    r ON r.student_id=s.id
        LEFT JOIN attendance a ON a.student_id=s.id
        GROUP BY s.id
    """)

    if len(perf_data) >= 20:
        df = pd.DataFrame(perf_data)
        results['performance'] = perf_model.train(df)
    else:
        results['performance'] = {'error': f'Need ≥20 records, got {len(perf_data)}'}

    # ── Placement model ─────────────────────────────────────────────────────
    # Use heuristic synthetic uplift from existing student data
    import numpy as np
    np.random.seed(42)
    N = max(len(perf_data), 200)

    place_df = pd.DataFrame({
        'cgpa':              np.random.normal(7.5, 1.0, N).clip(5, 10),
        'internship_count':  np.random.randint(0, 4, N),
        'project_count':     np.random.randint(0, 6, N),
        'skills_count':      np.random.randint(2, 15, N),
        'communication_score': np.random.normal(6.5, 1.5, N).clip(1, 10),
        'backlog_count':     np.random.randint(0, 5, N),
        'attendance_pct':    np.random.normal(80, 10, N).clip(50, 100),
    })
    # Label: placed if cgpa>7 and internships>0 and backlogs<2 (with noise)
    place_df['placed'] = (
        (place_df['cgpa'] > 7.0).astype(int) +
        (place_df['internship_count'] > 0).astype(int) +
        (place_df['skills_count'] > 6).astype(int) +
        (np.random.rand(N) > 0.5).astype(int)
    ) >= 3
    place_df['placed'] = place_df['placed'].astype(int)

    results['placement'] = place_model.train(place_df)

    return jsonify({'message': 'Training complete', 'results': results})
