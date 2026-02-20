"""
routes/face_attendance.py
=========================
Blueprint for Face Recognition Attendance endpoints:

  POST /ml/face/register          — register student face from image upload
  POST /ml/face/recognise         — identify face + mark attendance
  GET  /ml/face/status/<student>  — check if face registered
  GET  /ml/attendance/export      — export CSV for a date/subject
  GET  /ml/attendance/summary     — stats for a student or all students
"""

import csv, io, datetime
from flask import Blueprint, request, jsonify, Response
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from database import query, execute
import ml.face_engine as face_engine

bp = Blueprint('face_attendance', __name__)


@bp.route('/face/register', methods=['POST'])
def register():
    """Register a student's face. Accepts multipart/form-data with 'image' and 'student_id'."""
    student_id = request.form.get('student_id', type=int)
    if not student_id:
        return jsonify({'error': 'student_id required'}), 400

    file = request.files.get('image')
    if not file:
        return jsonify({'error': 'image file required'}), 400

    result = face_engine.register_face(student_id, file.read(), execute)
    return jsonify(result), 200 if result['success'] else 422


@bp.route('/face/recognise', methods=['POST'])
def recognise():
    """
    Send a webcam frame to recognise the student and mark attendance.
    Form fields: 'image' (file), 'subject' (string)
    """
    subject = request.form.get('subject', 'General')
    file    = request.files.get('image')
    if not file:
        return jsonify({'error': 'image required'}), 400

    def _query(sql, params=(), one=False):
        return query(sql, params, one=one)

    result = face_engine.recognize_and_mark(file.read(), subject, execute, _query)
    return jsonify(result)


@bp.route('/face/status/<int:student_id>', methods=['GET'])
def face_status(student_id):
    """Check if a student's face has been registered."""
    rows = query("SELECT id, registered_at FROM face_embeddings WHERE student_id=?", (student_id,))
    return jsonify({'registered': bool(rows), 'data': rows[0] if rows else None})


@bp.route('/face/stats', methods=['GET'])
def face_stats():
    """Return overall face registration statistics."""
    total_students   = query("SELECT COUNT(*) as cnt FROM students", one=True)['cnt']
    total_registered = face_engine.get_registered_count()
    return jsonify({
        'total_students':   total_students,
        'registered_faces': total_registered,
        'unregistered':     total_students - total_registered,
        'coverage_pct':     round(total_registered / max(total_students, 1) * 100, 1),
    })


@bp.route('/attendance/export', methods=['GET'])
def export_csv():
    """
    Export attendance as CSV.
    Query params: date (YYYY-MM-DD, default today), subject (optional)
    """
    date    = request.args.get('date', datetime.date.today().isoformat())
    subject = request.args.get('subject', '')

    sql = """
        SELECT u.name, s.roll_no, u.dept, a.subject, a.date, a.status
        FROM attendance a
        JOIN students s ON s.id = a.student_id
        JOIN users    u ON u.id = s.user_id
        WHERE a.date = ?
    """
    params = [date]
    if subject:
        sql    += " AND a.subject = ?"
        params.append(subject)
    sql += " ORDER BY s.roll_no"

    rows = query(sql, params)

    # Build CSV in memory
    out = io.StringIO()
    writer = csv.DictWriter(out, fieldnames=['name', 'roll_no', 'dept', 'subject', 'date', 'status'])
    writer.writeheader()
    writer.writerows(rows)

    return Response(
        out.getvalue(),
        mimetype='text/csv',
        headers={'Content-Disposition': f'attachment;filename=attendance_{date}.csv'}
    )


@bp.route('/attendance/summary', methods=['GET'])
def summary():
    """
    Attendance summary for a student (or all students).
    Query params: student_id (optional), dept (optional)
    """
    student_id = request.args.get('student_id', type=int)
    dept       = request.args.get('dept', '')

    if student_id:
        sql = """
            SELECT a.subject,
                   COUNT(*) as total,
                   SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END) as present,
                   ROUND(100.0*SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END)/COUNT(*),1) as pct
            FROM attendance a WHERE a.student_id=?
            GROUP BY a.subject ORDER BY a.subject
        """
        data = query(sql, (student_id,))
    else:
        sql = """
            SELECT u.dept,
                   COUNT(DISTINCT a.student_id) as students,
                   ROUND(AVG(CASE WHEN a.status='present' THEN 100.0 ELSE 0 END),1) as avg_pct
            FROM attendance a
            JOIN students s ON s.id=a.student_id
            JOIN users    u ON u.id=s.user_id
            WHERE (?='' OR u.dept=?)
            GROUP BY u.dept ORDER BY avg_pct DESC
        """
        data = query(sql, (dept, dept))

    return jsonify({'data': data, 'count': len(data)})
