const router = require('express').Router()
const { query } = require('../db')
const auth = require('../middleware/auth')

// GET /api/staff/me/dashboard
router.get('/me/dashboard', auth, async (req, res) => {
    if (req.user.role !== 'staff') return res.status(403).json({ error: 'Forbidden' })
    try {
        const [staff] = await query('SELECT * FROM staff WHERE user_id = $1', [req.user.id])
        if (!staff) return res.status(404).json({ error: 'Staff not found' })

        const today = new Date().toISOString().slice(0, 10)
        const subjects = JSON.parse(staff.subjects || '[]')

        const [studentCount] = await query('SELECT COUNT(DISTINCT student_id) as c FROM attendance WHERE marked_by = $1', [staff.id])
        const [notesCount] = await query('SELECT COUNT(*) as c FROM notes WHERE staff_id = $1', [staff.id])

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const todayDay = dayNames[new Date().getDay()]
        const todaySchedule = await query('SELECT * FROM timetable WHERE staff_id = $1 AND day = $2 ORDER BY period', [staff.id, todayDay])

        const [pendingLeave] = await query("SELECT COUNT(*) as c FROM leave_requests WHERE staff_id = $1 AND status = 'Pending'", [staff.id])
        const approvedLeave = await query("SELECT type, COUNT(*) as used FROM leave_requests WHERE staff_id = $1 AND status = 'Approved' GROUP BY type", [staff.id])
        const leaveUsed = {}
        approvedLeave.forEach(l => { leaveUsed[l.type] = parseInt(l.used) })

        const [todayAtt] = await query('SELECT COUNT(*) as c FROM attendance WHERE marked_by = $1 AND date = $2', [staff.id, today])

        res.json({
            staff: { ...staff, name: req.user.name, email: req.user.email, dept: req.user.dept, subjectsList: subjects },
            stats: {
                studentsCount: parseInt(studentCount.c) || 180,
                notesCount: parseInt(notesCount.c),
                todayAttendanceMarked: parseInt(todayAtt.c),
                pendingLeave: parseInt(pendingLeave.c),
            },
            todaySchedule,
            leaveUsed,
        })
    } catch (e) { res.status(500).json({ error: e.message }) }
})

// GET /api/staff/me/timetable
router.get('/me/timetable', auth, async (req, res) => {
    if (req.user.role !== 'staff') return res.status(403).json({ error: 'Forbidden' })
    try {
        const [staff] = await query('SELECT id FROM staff WHERE user_id = $1', [req.user.id])
        const tt = await query('SELECT * FROM timetable WHERE staff_id = $1 ORDER BY day, period', [staff.id])
        res.json(tt)
    } catch (e) { res.status(500).json({ error: e.message }) }
})

// PUT /api/staff/me/timetable
router.put('/me/timetable', auth, async (req, res) => {
    if (req.user.role !== 'staff') return res.status(403).json({ error: 'Forbidden' })
    try {
        const [staff] = await query('SELECT id FROM staff WHERE user_id = $1', [req.user.id])
        const { rows } = req.body
        if (!Array.isArray(rows)) return res.status(400).json({ error: 'rows must be array' })

        for (const r of rows) {
            await query(
                `INSERT INTO timetable (staff_id, day, period, subject) VALUES ($1,$2,$3,$4)
                 ON CONFLICT (staff_id, day, period) DO UPDATE SET subject = EXCLUDED.subject`,
                [staff.id, r.day, r.period, r.subject]
            )
        }
        res.json({ message: 'Timetable saved' })
    } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
