const router = require('express').Router()
const { query } = require('../db')
const auth = require('../middleware/auth')

const LEAVE_TOTAL = { 'Casual Leave': 10, 'Medical Leave': 12, 'On-Duty Leave': 8, 'Emergency Leave': 5, 'Maternity/Paternity Leave': 90 }

// GET /api/leave
router.get('/', auth, async (req, res) => {
    if (req.user.role !== 'staff') return res.status(403).json({ error: 'Forbidden' })
    try {
        const [staff] = await query('SELECT id FROM staff WHERE user_id = $1', [req.user.id])
        const requests = await query('SELECT * FROM leave_requests WHERE staff_id = $1 ORDER BY created_at DESC', [staff.id])

        const approved = await query("SELECT type, COUNT(*) as used FROM leave_requests WHERE staff_id = $1 AND status='Approved' GROUP BY type", [staff.id])
        const used = {}
        approved.forEach(a => { used[a.type] = parseInt(a.used) })
        const balance = Object.entries(LEAVE_TOTAL).reduce((acc, [type, total]) => {
            acc[type] = { total, used: used[type] || 0, remaining: total - (used[type] || 0) }
            return acc
        }, {})

        res.json({ requests, balance })
    } catch (e) { res.status(500).json({ error: e.message }) }
})

// POST /api/leave
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'staff') return res.status(403).json({ error: 'Forbidden' })
    try {
        const [staff] = await query('SELECT id FROM staff WHERE user_id = $1', [req.user.id])
        const { type, from_date, to_date, reason } = req.body
        if (!type || !from_date || !to_date || !reason) return res.status(400).json({ error: 'All fields required' })

        const [row] = await query(
            'INSERT INTO leave_requests (staff_id, type, from_date, to_date, reason) VALUES ($1,$2,$3,$4,$5) RETURNING id',
            [staff.id, type, from_date, to_date, reason]
        )
        res.json({ id: row.id, type, from_date, to_date, reason, status: 'Pending', message: 'Leave request submitted!' })
    } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
