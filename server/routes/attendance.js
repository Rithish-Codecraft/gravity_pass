const router = require('express').Router()
const db = require('../db')
const auth = require('../middleware/auth')

// GET /api/attendance?date=YYYY-MM-DD&subject=XX  (staff gets student list with status)
router.get('/', auth, (req, res) => {
    if (req.user.role !== 'staff') return res.status(403).json({ error: 'Forbidden' })
    const staff = db.prepare('SELECT id FROM staff WHERE user_id = ?').get(req.user.id)
    const { date, subject } = req.query
    const targetDate = date || new Date().toISOString().slice(0, 10)

    // Get all students
    const students = db.prepare(`
    SELECT s.id, s.roll_no, s.section, u.name, u.dept
    FROM students s JOIN users u ON s.user_id = u.id
    ORDER BY s.roll_no
  `).all()

    // Get attendance for this date/subject
    const records = db.prepare('SELECT student_id, status FROM attendance WHERE date = ? AND subject = ?').all(targetDate, subject || '')
    const recordMap = {}
    records.forEach(r => { recordMap[r.student_id] = r.status })

    const result = students.map(s => ({
        ...s, status: recordMap[s.id] || null
    }))
    res.json(result)
})

// POST /api/attendance/submit  (staff submits attendance for a class)
router.post('/submit', auth, (req, res) => {
    if (req.user.role !== 'staff') return res.status(403).json({ error: 'Forbidden' })
    const staff = db.prepare('SELECT id FROM staff WHERE user_id = ?').get(req.user.id)
    const { date, subject, records } = req.body
    // records: [{student_id, status}]
    if (!date || !subject || !Array.isArray(records)) return res.status(400).json({ error: 'date, subject, records required' })

    const upsert = db.prepare(`
    INSERT INTO attendance (student_id, subject, date, status, marked_by)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(student_id, subject, date) DO NOTHING
  `)

    // Attendance may not have unique constraint; just insert
    const insert = db.prepare(`INSERT OR IGNORE INTO attendance (student_id, subject, date, status, marked_by) VALUES (?,?,?,?,?)`)
    db.transaction(() => {
        records.forEach(r => insert.run(r.student_id, subject, date, r.status, staff.id))
    })()

    res.json({ message: `Attendance saved for ${records.length} students` })
})

module.exports = router
