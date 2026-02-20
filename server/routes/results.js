const router = require('express').Router()
const { query } = require('../db')
const auth = require('../middleware/auth')

// GET /api/results
router.get('/', auth, async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' })
    try {
        const [student] = await query('SELECT * FROM students WHERE user_id = $1', [req.user.id])
        if (!student) return res.status(404).json({ error: 'Student not found' })

        const { semester } = req.query
        const results = semester
            ? await query('SELECT * FROM results WHERE student_id = $1 AND semester = $2 ORDER BY id', [student.id, parseInt(semester)])
            : await query('SELECT * FROM results WHERE student_id = $1 ORDER BY semester DESC, id', [student.id])

        const sgpaRows = await query(
            'SELECT semester, AVG(gpa) as sgpa FROM results WHERE student_id = $1 GROUP BY semester ORDER BY semester',
            [student.id]
        )
        const sgpaMap = {}
        sgpaRows.forEach(r => { sgpaMap[r.semester] = parseFloat(parseFloat(r.sgpa).toFixed(2)) })

        res.json({ results, sgpaMap, student })
    } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
