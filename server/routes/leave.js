const router = require('express').Router()
const db = require('../db')
const auth = require('../middleware/auth')

const LEAVE_TOTAL = { 'Casual Leave': 10, 'Medical Leave': 12, 'On-Duty Leave': 8, 'Emergency Leave': 5, 'Maternity/Paternity Leave': 90 }

// GET /api/leave
router.get('/', auth, (req, res) => {
    if (req.user.role !== 'staff') return res.status(403).json({ error: 'Forbidden' })
    const staff = db.prepare('SELECT id FROM staff WHERE user_id = ?').get(req.user.id)
    const requests = db.prepare('SELECT * FROM leave_requests WHERE staff_id = ? ORDER BY created_at DESC').all(staff.id)

    // Compute balance
    const approved = db.prepare("SELECT type, COUNT(*) as used FROM leave_requests WHERE staff_id = ? AND status='Approved' GROUP BY type").all(staff.id)
    const used = {}
    approved.forEach(a => { used[a.type] = a.used })
    const balance = Object.entries(LEAVE_TOTAL).reduce((acc, [type, total]) => {
        acc[type] = { total, used: used[type] || 0, remaining: total - (used[type] || 0) }
        return acc
    }, {})

    res.json({ requests, balance })
})

// POST /api/leave
router.post('/', auth, (req, res) => {
    if (req.user.role !== 'staff') return res.status(403).json({ error: 'Forbidden' })
    const staff = db.prepare('SELECT id FROM staff WHERE user_id = ?').get(req.user.id)
    const { type, from_date, to_date, reason } = req.body
    if (!type || !from_date || !to_date || !reason) return res.status(400).json({ error: 'All fields required' })

    const info = db.prepare('INSERT INTO leave_requests (staff_id, type, from_date, to_date, reason) VALUES (?,?,?,?,?)').run(staff.id, type, from_date, to_date, reason)
    res.json({ id: info.lastInsertRowid, type, from_date, to_date, reason, status: 'Pending', message: 'Leave request submitted!' })
})

module.exports = router
