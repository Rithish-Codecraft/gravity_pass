const router = require('express').Router()
const { query } = require('../db')
const auth = require('../middleware/auth')

// GET /api/announcements
router.get('/', auth, async (req, res) => {
    try {
        const anns = await query(`
            SELECT a.*, u.name as author_name
            FROM announcements a JOIN users u ON a.created_by = u.id
            ORDER BY a.created_at DESC
        `)
        res.json(anns)
    } catch (e) { res.status(500).json({ error: e.message }) }
})

// POST /api/announcements
router.post('/', auth, async (req, res) => {
    if (req.user.role === 'student') return res.status(403).json({ error: 'Forbidden' })
    try {
        const { title, body, target, urgent } = req.body
        if (!title || !body) return res.status(400).json({ error: 'title and body required' })

        const [row] = await query(
            'INSERT INTO announcements (title, body, target, urgent, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING id',
            [title, body, target || 'All Students', urgent ? 1 : 0, req.user.id]
        )
        res.json({ id: row.id, title, body, target, urgent, message: 'Announcement published!' })
    } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
