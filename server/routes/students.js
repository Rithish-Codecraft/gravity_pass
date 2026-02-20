const router = require('express').Router()
const db = require('../db')
const auth = require('../middleware/auth')

// GET /api/students/me/dashboard
router.get('/me/dashboard', auth, (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' })
    const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(req.user.id)
    if (!student) return res.status(404).json({ error: 'Student not found' })

    // Attendance stats
    const totalClasses = db.prepare('SELECT COUNT(*) as c FROM attendance WHERE student_id = ?').get(student.id)
    const presentClasses = db.prepare("SELECT COUNT(*) as c FROM attendance WHERE student_id = ? AND status = 'present'").get(student.id)
    const attendancePct = totalClasses.c > 0 ? Math.round((presentClasses.c / totalClasses.c) * 100) : 0

    // Recent results (current semester)
    const results = db.prepare('SELECT * FROM results WHERE student_id = ? AND semester = ? ORDER BY id').all(student.id, student.semester)

    const cgpa = results.length
        ? (results.reduce((a, r) => a + r.gpa, 0) / results.length).toFixed(2)
        : student.cgpa

    // Achievements from results
    const achievements = []
    if (parseFloat(cgpa) >= 9.0) achievements.push({ icon: '🏅', title: 'Dean\'s List', desc: 'CGPA ≥ 9.0' })
    if (student.streak >= 7) achievements.push({ icon: '🔥', title: `${student.streak}-Day Streak`, desc: 'Consistent attendance' })
    if (student.rank <= 5) achievements.push({ icon: '🥇', title: `Rank #${student.rank}`, desc: 'Top 5 in class' })

    // Assignments submitted (from results)
    const assignmentsMax = results.length * 5 || 10
    const assignmentsSubmitted = Math.round(assignmentsMax * 0.9)

    res.json({
        student: { ...student, name: req.user.name, email: req.user.email, dept: req.user.dept },
        cgpa: parseFloat(cgpa),
        attendance: { pct: attendancePct, present: presentClasses.c, total: totalClasses.c },
        results,
        achievements,
        assignments: { submitted: assignmentsSubmitted, total: assignmentsMax },
    })
})

// GET /api/students/me/attendance-log
router.get('/me/attendance-log', auth, (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' })
    const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(req.user.id)
    const log = db.prepare('SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC, id DESC LIMIT 30').all(student.id)
    res.json(log)
})

// POST /api/students/me/attendance/punch
router.post('/me/attendance/punch', auth, (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' })
    const { subject, room } = req.body
    const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(req.user.id)
    const today = new Date().toISOString().slice(0, 10)

    // Prevent double punch
    const existing = db.prepare('SELECT id FROM attendance WHERE student_id = ? AND subject = ? AND date = ?').get(student.id, subject || 'General', today)
    if (existing) return res.status(409).json({ error: 'Already punched in today for this subject' })

    const stmt = db.prepare("INSERT INTO attendance (student_id, subject, date, status) VALUES (?,?,?,'present')")
    const info = stmt.run(student.id, subject || 'General', today)
    res.json({ id: info.lastInsertRowid, subject, date: today, status: 'present', message: 'Attendance marked!' })
})

module.exports = router
