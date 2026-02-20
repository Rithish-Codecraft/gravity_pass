const router = require('express').Router()
const { query } = require('../db')
const auth = require('../middleware/auth')

// GET /api/fees
router.get('/', auth, async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' })
    try {
        const [student] = await query('SELECT id FROM students WHERE user_id = $1', [req.user.id])
        const fees = await query('SELECT * FROM fees WHERE student_id = $1 ORDER BY id', [student.id])
        const totalDue = fees.filter(f => f.status !== 'Paid').reduce((a, f) => a + f.amount, 0)
        res.json({ fees, totalDue })
    } catch (e) { res.status(500).json({ error: e.message }) }
})

// PATCH /api/fees/:id/pay
router.patch('/:id/pay', auth, async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' })
    try {
        const [student] = await query('SELECT id FROM students WHERE user_id = $1', [req.user.id])
        const [fee] = await query('SELECT * FROM fees WHERE id = $1 AND student_id = $2', [req.params.id, student.id])
        if (!fee) return res.status(404).json({ error: 'Fee not found' })
        if (fee.status === 'Paid') return res.status(409).json({ error: 'Already paid' })

        const paidOn = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        await query("UPDATE fees SET status='Paid', paid_on=$1 WHERE id=$2", [paidOn, fee.id])
        res.json({ message: 'Payment recorded', paidOn })
    } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
