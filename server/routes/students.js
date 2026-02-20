const router = require('express').Router()
const { query } = require('../db')
const auth = require('../middleware/auth')

// GET /api/students/me/dashboard
router.get('/me/dashboard', auth, async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' })
    try {
        const [student] = await query('SELECT * FROM students WHERE user_id = $1', [req.user.id])
        if (!student) return res.status(404).json({ error: 'Student not found' })

        const [totalRow] = await query('SELECT COUNT(*) as c FROM attendance WHERE student_id = $1', [student.id])
        const [presentRow] = await query("SELECT COUNT(*) as c FROM attendance WHERE student_id = $1 AND status = 'present'", [student.id])
        const total = parseInt(totalRow.c), present = parseInt(presentRow.c)
        const attendancePct = total > 0 ? Math.round((present / total) * 100) : 0

        const results = await query('SELECT * FROM results WHERE student_id = $1 AND semester = $2 ORDER BY id', [student.id, student.semester])
        const cgpa = results.length
            ? (results.reduce((a, r) => a + r.gpa, 0) / results.length).toFixed(2)
            : student.cgpa

        const achievements = []
        if (parseFloat(cgpa) >= 9.0) achievements.push({ icon: '🏅', title: "Dean's List", desc: 'CGPA ≥ 9.0' })
        if (student.streak >= 7) achievements.push({ icon: '🔥', title: `${student.streak}-Day Streak`, desc: 'Consistent attendance' })
        if (student.rank <= 5 && student.rank > 0) achievements.push({ icon: '🥇', title: `Rank #${student.rank}`, desc: 'Top 5 in class' })

        const assignmentsMax = results.length * 5 || 10
        res.json({
            student: { ...student, name: req.user.name, email: req.user.email, dept: req.user.dept },
            cgpa: parseFloat(cgpa),
            attendance: { pct: attendancePct, present, total },
            results,
            achievements,
            assignments: { submitted: Math.round(assignmentsMax * 0.9), total: assignmentsMax },
        })
    } catch (e) { res.status(500).json({ error: e.message }) }
})

// GET /api/students/me/attendance-log
router.get('/me/attendance-log', auth, async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' })
    try {
        const [student] = await query('SELECT id FROM students WHERE user_id = $1', [req.user.id])
        const log = await query('SELECT * FROM attendance WHERE student_id = $1 ORDER BY date DESC, id DESC LIMIT 30', [student.id])
        res.json(log)
    } catch (e) { res.status(500).json({ error: e.message }) }
})

// POST /api/students/me/attendance/punch
router.post('/me/attendance/punch', auth, async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' })
    try {
        const { subject } = req.body
        const [student] = await query('SELECT id FROM students WHERE user_id = $1', [req.user.id])
        const today = new Date().toISOString().slice(0, 10)
        const subj = subject || 'General'

        const [existing] = await query('SELECT id FROM attendance WHERE student_id = $1 AND subject = $2 AND date = $3', [student.id, subj, today])
        if (existing) return res.status(409).json({ error: 'Already punched in today for this subject' })

        const [row] = await query(
            "INSERT INTO attendance (student_id, subject, date, status) VALUES ($1,$2,$3,'present') RETURNING id",
            [student.id, subj, today]
        )
        res.json({ id: row.id, subject: subj, date: today, status: 'present', message: 'Attendance marked!' })
    } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
