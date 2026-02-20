const router = require('express').Router()
const db = require('../db')
const auth = require('../middleware/auth')

// GET /api/fees  — student's own fees
router.get('/', auth, (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' })
    const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(req.user.id)
    const fees = db.prepare('SELECT * FROM fees WHERE student_id = ? ORDER BY id').all(student.id)
    const totalDue = fees.filter(f => f.status !== 'Paid').reduce((a, f) => a + f.amount, 0)
    res.json({ fees, totalDue })
})

// PATCH /api/fees/:id/pay  — mark a fee as paid
router.patch('/:id/pay', auth, (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' })
    const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(req.user.id)
    const fee = db.prepare('SELECT * FROM fees WHERE id = ? AND student_id = ?').get(req.params.id, student.id)
    if (!fee) return res.status(404).json({ error: 'Fee not found' })
    if (fee.status === 'Paid') return res.status(409).json({ error: 'Already paid' })

    const paidOn = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    db.prepare("UPDATE fees SET status='Paid', paid_on=? WHERE id=?").run(paidOn, fee.id)
    res.json({ message: 'Payment recorded', paidOn })
})

module.exports = router
