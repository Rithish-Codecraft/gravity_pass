const router = require('express').Router()
const { query } = require('../db')
const auth = require('../middleware/auth')

// GET /api/events
router.get('/', auth, async (req, res) => {
    try {
        const events = await query('SELECT * FROM events ORDER BY id')
        let registrations = []
        if (req.user.role === 'student') {
            const [student] = await query('SELECT id FROM students WHERE user_id = $1', [req.user.id])
            if (student) {
                const regs = await query('SELECT event_id FROM event_registrations WHERE student_id = $1', [student.id])
                registrations = regs.map(r => r.event_id)
            }
        }
        res.json(events.map(e => ({ ...e, registered: registrations.includes(e.id) })))
    } catch (e) { res.status(500).json({ error: e.message }) }
})

// POST /api/events/:id/register
router.post('/:id/register', auth, async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can register' })
    try {
        const [student] = await query('SELECT id FROM students WHERE user_id = $1', [req.user.id])
        const [event] = await query('SELECT * FROM events WHERE id = $1', [req.params.id])
        if (!event) return res.status(404).json({ error: 'Event not found' })
        if (event.filled >= event.seats) return res.status(409).json({ error: 'Event is full' })

        await query('INSERT INTO event_registrations (event_id, student_id) VALUES ($1,$2)', [event.id, student.id])
        await query('UPDATE events SET filled = filled + 1 WHERE id = $1', [event.id])
        res.json({ message: 'Registered successfully!' })
    } catch (e) {
        res.status(409).json({ error: 'Already registered' })
    }
})

// DELETE /api/events/:id/register
router.delete('/:id/register', auth, async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' })
    try {
        const [student] = await query('SELECT id FROM students WHERE user_id = $1', [req.user.id])
        const result = await require('../db').pool.query(
            'DELETE FROM event_registrations WHERE event_id = $1 AND student_id = $2',
            [req.params.id, student.id]
        )
        if (result.rowCount === 0) return res.status(404).json({ error: 'Registration not found' })
        await query('UPDATE events SET filled = GREATEST(0, filled - 1) WHERE id = $1', [req.params.id])
        res.json({ message: 'Registration cancelled' })
    } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
