const router = require('express').Router()
const { query } = require('../db')
const auth = require('../middleware/auth')

// GET /api/feedback/averages?staff_id=X
router.get('/averages', auth, async (req, res) => {
    try {
        const { staff_id } = req.query
        const results = staff_id
            ? await query('SELECT aspect, AVG(rating) as avg, COUNT(*) as count FROM feedback WHERE staff_id = $1 GROUP BY aspect', [staff_id])
            : await query('SELECT staff_id, AVG(rating) as avg, COUNT(*) as count FROM feedback GROUP BY staff_id')
        res.json(results)
    } catch (e) { res.status(500).json({ error: e.message }) }
})

// POST /api/feedback
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students may submit feedback' })
    try {
        const [student] = await query('SELECT id FROM students WHERE user_id = $1', [req.user.id])
        const { staff_id, subject, ratings, comments, anonymous } = req.body
        if (!staff_id || !subject || !ratings) return res.status(400).json({ error: 'staff_id, subject, ratings required' })

        for (const [aspect, rating] of Object.entries(ratings)) {
            await query(
                'INSERT INTO feedback (student_id, staff_id, subject, aspect, rating, comments, anonymous) VALUES ($1,$2,$3,$4,$5,$6,$7)',
                [student.id, staff_id, subject, aspect, rating, comments || '', anonymous ? 1 : 0]
            )
        }
        res.json({ message: 'Feedback submitted, thank you!' })
    } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
