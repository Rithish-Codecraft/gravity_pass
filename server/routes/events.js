const router = require('express').Router()
const db = require('../db')
const auth = require('../middleware/auth')

// GET /api/events
router.get('/', auth, (req, res) => {
    const events = db.prepare('SELECT * FROM events ORDER BY id').all()

    let registrations = []
    if (req.user.role === 'student') {
        const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(req.user.id)
        if (student) {
            registrations = db.prepare('SELECT event_id FROM event_registrations WHERE student_id = ?').all(student.id).map(r => r.event_id)
        }
    }

    const result = events.map(e => ({ ...e, registered: registrations.includes(e.id) }))
    res.json(result)
})

// POST /api/events/:id/register
router.post('/:id/register', auth, (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can register' })
    const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(req.user.id)
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id)
    if (!event) return res.status(404).json({ error: 'Event not found' })
    if (event.filled >= event.seats) return res.status(409).json({ error: 'Event is full' })

    try {
        db.prepare('INSERT INTO event_registrations (event_id, student_id) VALUES (?,?)').run(event.id, student.id)
        db.prepare('UPDATE events SET filled = filled + 1 WHERE id = ?').run(event.id)
        res.json({ message: 'Registered successfully!' })
    } catch (e) {
        return res.status(409).json({ error: 'Already registered' })
    }
})

// DELETE /api/events/:id/register  — cancel registration
router.delete('/:id/register', auth, (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' })
    const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(req.user.id)
    const info = db.prepare('DELETE FROM event_registrations WHERE event_id = ? AND student_id = ?').run(req.params.id, student.id)
    if (info.changes === 0) return res.status(404).json({ error: 'Registration not found' })
    db.prepare('UPDATE events SET filled = MAX(0, filled - 1) WHERE id = ?').run(req.params.id)
    res.json({ message: 'Registration cancelled' })
})

module.exports = router
