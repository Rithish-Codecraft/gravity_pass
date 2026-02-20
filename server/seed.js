const db = require('./db')
const bcrypt = require('bcryptjs')

console.log('🌱 Seeding EduSphere database...')

const hash = (p) => bcrypt.hashSync(p, 10)

/* ——— Users ——————————————————————————————————————— */
const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (name, email, password_hash, role, dept)
  VALUES (?, ?, ?, ?, ?)
`)

const users = [
    // Admin
    ['Ram Krishnan', 'admin@edu.ac.in', hash('admin123'), 'admin', 'Admin'],
    // Staff
    ['Dr. Priya Menon', 'priya@edu.ac.in', hash('staff123'), 'staff', 'CSE'],
    ['Prof. Rajan Kumar', 'rajan@edu.ac.in', hash('staff123'), 'staff', 'CSE'],
    ['Dr. Ananya Pillai', 'ananya@edu.ac.in', hash('staff123'), 'staff', 'ECE'],
    ['Prof. Vikram Nair', 'vikram@edu.ac.in', hash('staff123'), 'staff', 'MECH'],
    ['Dr. Lakshmi Roy', 'lakshmi@edu.ac.in', hash('staff123'), 'staff', 'CSE'],
    // Students
    ['Arjun Sharma', 'arjun@edu.ac.in', hash('student123'), 'student', 'CSE'],
    ['Priya Nair', 'priya.s@edu.ac.in', hash('student123'), 'student', 'CSE'],
    ['Meera Iyer', 'meera@edu.ac.in', hash('student123'), 'student', 'CSE'],
    ['Karthik Rajan', 'karthik@edu.ac.in', hash('student123'), 'student', 'CSE'],
    ['Divya Menon', 'divya@edu.ac.in', hash('student123'), 'student', 'CSE'],
    ['Arun Kumar', 'arun@edu.ac.in', hash('student123'), 'student', 'CSE'],
    ['Sneha Patel', 'sneha@edu.ac.in', hash('student123'), 'student', 'ECE'],
]
users.forEach(u => insertUser.run(...u))

const getUser = (email) => db.prepare('SELECT id FROM users WHERE email=?').get(email)

/* ——— Students ——————————————————————————————————— */
const insertStudent = db.prepare(`
  INSERT OR IGNORE INTO students (user_id, roll_no, semester, cgpa, rank, section, streak)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`)
const studentData = [
    [getUser('arjun@edu.ac.in').id, 'CS21001', 6, 9.2, 4, 'B', 12],
    [getUser('priya.s@edu.ac.in').id, 'CS21002', 6, 9.8, 1, 'A', 30],
    [getUser('meera@edu.ac.in').id, 'CS21008', 6, 9.5, 2, 'B', 20],
    [getUser('karthik@edu.ac.in').id, 'CS21005', 6, 9.3, 3, 'A', 15],
    [getUser('divya@edu.ac.in').id, 'CS21006', 6, 8.7, 6, 'B', 8],
    [getUser('arun@edu.ac.in').id, 'CS21007', 6, 7.2, 10, 'A', 3],
    [getUser('sneha@edu.ac.in').id, 'EC21004', 6, 6.8, 14, 'A', 2],
]
studentData.forEach(s => insertStudent.run(...s))

const getStudent = (email) => {
    const u = getUser(email)
    return db.prepare('SELECT id FROM students WHERE user_id=?').get(u.id)
}

/* ——— Staff ——————————————————————————————————————— */
const insertStaff = db.prepare(`
  INSERT OR IGNORE INTO staff (user_id, designation, subjects, joining_date)
  VALUES (?, ?, ?, ?)
`)
const staffData = [
    [getUser('priya@edu.ac.in').id, 'Associate Professor', JSON.stringify(['Data Structures', 'Algorithms', 'OS', 'DBMS']), '2018-08-01'],
    [getUser('rajan@edu.ac.in').id, 'Assistant Professor', JSON.stringify(['Networks', 'OS']), '2019-07-01'],
    [getUser('ananya@edu.ac.in').id, 'Associate Professor', JSON.stringify(['Signals & Systems', 'VLSI']), '2020-01-01'],
    [getUser('vikram@edu.ac.in').id, 'Professor', JSON.stringify(['Thermodynamics', 'Fluid Mechanics']), '2017-06-01'],
    [getUser('lakshmi@edu.ac.in').id, 'Assistant Professor', JSON.stringify(['DBMS', 'Software Engineering']), '2021-08-01'],
]
staffData.forEach(s => insertStaff.run(...s))

const getStaff = (email) => {
    const u = getUser(email)
    return db.prepare('SELECT id FROM staff WHERE user_id=?').get(u.id)
}

/* ——— Attendance ————————————————————————————————— */
const insertAtt = db.prepare(`INSERT OR IGNORE INTO attendance (student_id, subject, date, status, marked_by) VALUES (?,?,?,?,?)`)
const arjunId = getStudent('arjun@edu.ac.in').id
const priyaStaffId = getStaff('priya@edu.ac.in').id
const attData = [
    [arjunId, 'Data Structures', '2026-02-20', 'present', priyaStaffId],
    [arjunId, 'Algorithms', '2026-02-20', 'present', priyaStaffId],
    [arjunId, 'Data Structures', '2026-02-19', 'present', priyaStaffId],
    [arjunId, 'DBMS', '2026-02-19', 'late', priyaStaffId],
    [arjunId, 'Algorithms', '2026-02-18', 'absent', priyaStaffId],
    [arjunId, 'Networks', '2026-02-18', 'present', priyaStaffId],
    [arjunId, 'OS', '2026-02-17', 'present', priyaStaffId],
    [arjunId, 'Data Structures', '2026-02-17', 'present', priyaStaffId],
]
attData.forEach(a => insertAtt.run(...a))

/* ——— Results ————————————————————————————————————— */
const insertResult = db.prepare(`INSERT OR IGNORE INTO results (student_id, subject, subject_code, semester, internal, external, total, grade, gpa) VALUES (?,?,?,?,?,?,?,?,?)`)
const subjectResults = [
    [arjunId, 'Data Structures', 'CS301', 6, 48, 85, 133, 'A', 9],
    [arjunId, 'Algorithms', 'CS302', 6, 50, 92, 142, 'A+', 10],
    [arjunId, 'DBMS', 'CS303', 6, 44, 78, 122, 'B+', 8],
    [arjunId, 'Networks', 'CS304', 6, 46, 84, 130, 'A', 9],
    [arjunId, 'OS', 'CS305', 6, 40, 73, 113, 'B', 7],
    // Semester 5
    [arjunId, 'Compiler Design', 'CS251', 5, 46, 88, 134, 'A', 9],
    [arjunId, 'Computer Networks', 'CS252', 5, 42, 80, 122, 'B+', 8],
    [arjunId, 'ML Fundamentals', 'CS253', 5, 48, 90, 138, 'A', 9],
]
subjectResults.forEach(r => insertResult.run(...r))

/* ——— Fees ——————————————————————————————————————— */
const insertFee = db.prepare(`INSERT OR IGNORE INTO fees (student_id, title, amount, due_date, category, status, paid_on) VALUES (?,?,?,?,?,?,?)`)
const feeData = [
    [arjunId, 'Tuition Fee – Semester 6', 45000, '2026-03-15', 'Academic', 'Pending', null],
    [arjunId, 'Hostel Fee – Q1 2026', 15000, '2026-02-28', 'Hostel', 'Overdue', null],
    [arjunId, 'Library & Lab Fee', 3500, '2026-03-15', 'Academic', 'Pending', null],
    [arjunId, 'Tuition Fee – Semester 5', 45000, '2025-09-15', 'Academic', 'Paid', '2025-09-12'],
    [arjunId, 'Hostel Fee – Q3 2025', 15000, '2025-07-30', 'Hostel', 'Paid', '2025-07-28'],
]
feeData.forEach(f => insertFee.run(...f))

/* ——— Events ————————————————————————————————————— */
const insertEvent = db.prepare(`INSERT OR IGNORE INTO events (title, date, time, venue, type, seats, filled, emoji) VALUES (?,?,?,?,?,?,?,?)`)
const eventsData = [
    ['Technical Symposium – TechFest 2026', 'Mar 14, 2026', '9:00 AM', 'Main Auditorium', 'Technical', 200, 178, '💻'],
    ['Inter-College Hackathon', 'Mar 20–21, 2026', '8:00 AM', 'Innovation Lab', 'Competition', 50, 42, '🚀'],
    ['Cultural Fest – Kaleidoscope', 'Apr 2, 2026', '5:00 PM', 'Open Air Theatre', 'Cultural', 1000, 650, '🎭'],
    ['Campus Placement Drive – TCS', 'Mar 25, 2026', '10:00 AM', 'Seminar Hall 3', 'Placement', 80, 78, '💼'],
    ['Blood Donation Camp', 'Mar 10, 2026', '9:00 AM', 'Health Center', 'Social', 100, 32, '🩸'],
]
eventsData.forEach(e => insertEvent.run(...e))

/* ——— Announcements ————————————————————————————— */
const insertAnn = db.prepare(`INSERT OR IGNORE INTO announcements (title, body, target, urgent, created_by) VALUES (?,?,?,?,?)`)
const adminId = getUser('admin@edu.ac.in').id
const annData = [
    ['End Semester Exam Schedule Released', 'End semester exams for Semester 6 are scheduled from March 20–April 5, 2026. Hall tickets will be distributed from March 10.', 'All Students', 1, adminId],
    ['Library Renovation – Partial Closure', 'The library reading room will be partially closed until March 5 for renovation. Reference section remains open.', 'All Students', 0, adminId],
    ['NPTEL Certification Registration Open', 'Students can now register for NPTEL online certifications for the Jan–Apr 2026 semester. Last date: March 1, 2026.', 'All Students', 0, adminId],
    ['Campus Wi-Fi Upgrade', 'Campus-wide Wi-Fi upgrade is scheduled for Feb 22 from 11 PM to 4 AM. Expect intermittent connectivity.', 'All', 1, adminId],
]
annData.forEach(a => insertAnn.run(...a))

/* ——— Leave Requests ——————————————————————————— */
const insertLeave = db.prepare(`INSERT OR IGNORE INTO leave_requests (staff_id, type, from_date, to_date, reason, status) VALUES (?,?,?,?,?,?)`)
const leaveData = [
    [priyaStaffId, 'Medical Leave', '2026-02-10', '2026-02-12', 'Medical treatment', 'Approved'],
    [priyaStaffId, 'Casual Leave', '2026-01-15', '2026-01-15', 'Personal work', 'Approved'],
    [priyaStaffId, 'On-Duty Leave', '2026-02-20', '2026-02-21', 'Conference at IIT Madras', 'Pending'],
]
leaveData.forEach(l => insertLeave.run(...l))

/* ——— Notes ——————————————————————————————————————— */
const insertNote = db.prepare(`INSERT OR IGNORE INTO notes (staff_id, title, subject, filename, size) VALUES (?,?,?,?,?)`)
const notesData = [
    [priyaStaffId, 'Unit 3 – Tree Traversal Notes', 'Data Structures', 'unit3_trees.pdf', '2.1 MB'],
    [priyaStaffId, 'Dynamic Programming Slides', 'Algorithms', 'dp_slides.pptx', '5.4 MB'],
    [priyaStaffId, 'OS Memory Management', 'OS', 'os_memory.pdf', '1.8 MB'],
]
notesData.forEach(n => insertNote.run(...n))

/* ——— Timetable ——————————————————————————————————— */
const insertTT = db.prepare(`INSERT OR IGNORE INTO timetable (staff_id, day, period, subject) VALUES (?,?,?,?)`)
const ttData = [
    [priyaStaffId, 'Mon', 1, 'DS'], [priyaStaffId, 'Mon', 3, 'Algo'],
    [priyaStaffId, 'Tue', 2, 'OS'], [priyaStaffId, 'Tue', 4, 'DS'],
    [priyaStaffId, 'Wed', 1, 'Algo'], [priyaStaffId, 'Wed', 3, 'DBMS'],
    [priyaStaffId, 'Thu', 2, 'DS'], [priyaStaffId, 'Thu', 4, 'OS'],
    [priyaStaffId, 'Fri', 1, 'DBMS'], [priyaStaffId, 'Fri', 3, 'Algo'],
]
ttData.forEach(t => insertTT.run(...t))

console.log('✅ Database seeded successfully!')
console.log('')
console.log('📋 Demo Credentials:')
console.log('  Admin  → admin@edu.ac.in   / admin123')
console.log('  Staff  → priya@edu.ac.in   / staff123')
console.log('  Student→ arjun@edu.ac.in   / student123')
