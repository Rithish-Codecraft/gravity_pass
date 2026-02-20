const router = require('express').Router()
const db = require('../db')
const auth = require('../middleware/auth')

// GET /api/results  — student's own results
router.get('/', auth, (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' })
    const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(req.user.id)
    if (!student) return res.status(404).json({ error: 'Student not found' })

    const { semester } = req.query

    const query = semester
        ? 'SELECT * FROM results WHERE student_id = ? AND semester = ? ORDER BY id'
        : 'SELECT * FROM results WHERE student_id = ? ORDER BY semester DESC, id'

    const results = semester
        ? db.prepare(query).all(student.id, parseInt(semester))
        : db.prepare(query).all(student.id)

    // Compute per-semester SGPA
    const sgpaMap = {}
    db.prepare('SELECT semester, AVG(gpa) as sgpa FROM results WHERE student_id = ? GROUP BY semester ORDER BY semester').all(student.id)
        .forEach(r => { sgpaMap[r.semester] = parseFloat(r.sgpa.toFixed(2)) })

    res.json({ results, sgpaMap, student })
})

module.exports = router
