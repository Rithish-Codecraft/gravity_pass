const router = require('express').Router()
const { query } = require('../db')
const auth = require('../middleware/auth')

// GET /api/attendance?date=YYYY-MM-DD&subject=XX
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'staff') return res.status(403).json({ error: 'Forbidden' })
  try {
    const [staff] = await query('SELECT id FROM staff WHERE user_id = $1', [req.user.id])
    const { date, subject } = req.query
    const targetDate = date || new Date().toISOString().slice(0, 10)

    const students = await query(`
            SELECT s.id, s.roll_no, s.section, u.name, u.dept
            FROM students s JOIN users u ON s.user_id = u.id ORDER BY s.roll_no
        `)
    const records = await query(
      'SELECT student_id, status FROM attendance WHERE date = $1 AND subject = $2',
      [targetDate, subject || '']
    )
    const recordMap = {}
    records.forEach(r => { recordMap[r.student_id] = r.status })
    res.json(students.map(s => ({ ...s, status: recordMap[s.id] || null })))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// POST /api/attendance/submit
router.post('/submit', auth, async (req, res) => {
  if (req.user.role !== 'staff') return res.status(403).json({ error: 'Forbidden' })
  try {
    const [staff] = await query('SELECT id FROM staff WHERE user_id = $1', [req.user.id])
    const { date, subject, records } = req.body
    if (!date || !subject || !Array.isArray(records)) return res.status(400).json({ error: 'date, subject, records required' })

    for (const r of records) {
      await query(
        `INSERT INTO attendance (student_id, subject, date, status, marked_by) VALUES ($1,$2,$3,$4,$5)
                 ON CONFLICT DO NOTHING`,
        [r.student_id, subject, date, r.status, staff.id]
      )
    }
    res.json({ message: `Attendance saved for ${records.length} students` })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
