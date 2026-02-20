const router = require('express').Router()
const db = require('../db')
const auth = require('../middleware/auth')

// GET /api/announcements
router.get('/', auth, (req, res) => {
    const anns = db.prepare(`
    SELECT a.*, u.name as author_name
    FROM announcements a JOIN users u ON a.created_by = u.id
    ORDER BY a.created_at DESC
  `).all()
    res.json(anns)
})

// POST /api/announcements  (staff/admin)
router.post('/', auth, (req, res) => {
    if (req.user.role === 'student') return res.status(403).json({ error: 'Forbidden' })
    const { title, body, target, urgent } = req.body
    if (!title || !body) return res.status(400).json({ error: 'title and body required' })

    const info = db.prepare('INSERT INTO announcements (title, body, target, urgent, created_by) VALUES (?,?,?,?,?)').run(
        title, body, target || 'All Students', urgent ? 1 : 0, req.user.id
    )
    res.json({ id: info.lastInsertRowid, title, body, target, urgent, message: 'Announcement published!' })
})

module.exports = router
