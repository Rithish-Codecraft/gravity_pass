const router = require('express').Router()
const db = require('../db')
const auth = require('../middleware/auth')

// GET /api/feedback/averages?staff_id=X  — average ratings per staff
router.get('/averages', auth, (req, res) => {
    const { staff_id } = req.query
    const query = staff_id
        ? 'SELECT aspect, AVG(rating) as avg, COUNT(*) as count FROM feedback WHERE staff_id = ? GROUP BY aspect'
        : 'SELECT staff_id, AVG(rating) as avg, COUNT(*) as count FROM feedback GROUP BY staff_id'
    const results = staff_id ? db.prepare(query).all(staff_id) : db.prepare(query).all()
    res.json(results)
})

// POST /api/feedback
router.post('/', auth, (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students may submit feedback' })
    const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(req.user.id)
    const { staff_id, subject, ratings, comments, anonymous } = req.body
    // ratings: { "Teaching Quality": 4, "Course Content": 5, ... }
    if (!staff_id || !subject || !ratings) return res.status(400).json({ error: 'staff_id, subject, ratings required' })

    const insert = db.prepare('INSERT INTO feedback (student_id, staff_id, subject, aspect, rating, comments, anonymous) VALUES (?,?,?,?,?,?,?)')
    db.transaction(() => {
        Object.entries(ratings).forEach(([aspect, rating]) => {
            insert.run(student.id, staff_id, subject, aspect, rating, comments || '', anonymous ? 1 : 0)
        })
    })()

    res.json({ message: 'Feedback submitted, thank you!' })
})

module.exports = router
