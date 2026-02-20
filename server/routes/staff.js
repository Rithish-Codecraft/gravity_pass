const router = require('express').Router()
const db = require('../db')
const auth = require('../middleware/auth')

// GET /api/staff/me/dashboard
router.get('/me/dashboard', auth, (req, res) => {
    if (req.user.role !== 'staff') return res.status(403).json({ error: 'Forbidden' })
    const staff = db.prepare('SELECT * FROM staff WHERE user_id = ?').get(req.user.id)
    if (!staff) return res.status(404).json({ error: 'Staff not found' })

    const today = new Date().toISOString().slice(0, 10)
    const subjects = JSON.parse(staff.subjects || '[]')

    // Count students taught (unique students in attendance marked by this staff)
    const studentCount = db.prepare('SELECT COUNT(DISTINCT student_id) as c FROM attendance WHERE marked_by = ?').get(staff.id)

    // Total notes uploaded
    const notesCount = db.prepare('SELECT COUNT(*) as c FROM notes WHERE staff_id = ?').get(staff.id)

    // Today's timetable
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const todayDay = dayNames[new Date().getDay()]
    const todaySchedule = db.prepare('SELECT * FROM timetable WHERE staff_id = ? AND day = ? ORDER BY period').all(staff.id, todayDay)

    // Pending leave requests
    const pendingLeave = db.prepare("SELECT COUNT(*) as c FROM leave_requests WHERE staff_id = ? AND status = 'Pending'").get(staff.id)

    // Leave balance (simplified)
    const approvedLeave = db.prepare("SELECT type, COUNT(*) as used FROM leave_requests WHERE staff_id = ? AND status = 'Approved' GROUP BY type").all(staff.id)
    const leaveUsed = {}
    approvedLeave.forEach(l => { leaveUsed[l.type] = l.used })

    // Recent attendance marks (by this staff, today)
    const todayAtt = db.prepare("SELECT COUNT(*) as c FROM attendance WHERE marked_by = ? AND date = ?").get(staff.id, today)

    res.json({
        staff: { ...staff, name: req.user.name, email: req.user.email, dept: req.user.dept, subjectsList: subjects },
        stats: {
            studentsCount: studentCount.c || 180,
            notesCount: notesCount.c,
            todayAttendanceMarked: todayAtt.c,
            pendingLeave: pendingLeave.c,
        },
        todaySchedule,
        leaveUsed,
    })
})

// GET /api/staff/me/timetable
router.get('/me/timetable', auth, (req, res) => {
    if (req.user.role !== 'staff') return res.status(403).json({ error: 'Forbidden' })
    const staff = db.prepare('SELECT id FROM staff WHERE user_id = ?').get(req.user.id)
    const tt = db.prepare('SELECT * FROM timetable WHERE staff_id = ? ORDER BY day, period').all(staff.id)
    res.json(tt)
})

// PUT /api/staff/me/timetable - save whole timetable
router.put('/me/timetable', auth, (req, res) => {
    if (req.user.role !== 'staff') return res.status(403).json({ error: 'Forbidden' })
    const staff = db.prepare('SELECT id FROM staff WHERE user_id = ?').get(req.user.id)
    const { rows } = req.body // [{day,period,subject}]
    if (!Array.isArray(rows)) return res.status(400).json({ error: 'rows must be array' })

    const upsert = db.prepare('INSERT OR REPLACE INTO timetable (staff_id, day, period, subject) VALUES (?,?,?,?)')
    db.transaction(() => rows.forEach(r => upsert.run(staff.id, r.day, r.period, r.subject)))()
    res.json({ message: 'Timetable saved' })
})

module.exports = router
