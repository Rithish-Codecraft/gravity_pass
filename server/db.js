const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')
const path = require('path')

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'edusphere.db')

const db = new Database(DB_PATH)

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ─── Schema ────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student','staff','admin')),
    dept TEXT DEFAULT 'CSE',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    roll_no TEXT UNIQUE NOT NULL,
    semester INTEGER DEFAULT 6,
    cgpa REAL DEFAULT 0.0,
    rank INTEGER DEFAULT 0,
    section TEXT DEFAULT 'B',
    streak INTEGER DEFAULT 7,
    batch TEXT DEFAULT '2021-2025'
  );

  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    designation TEXT DEFAULT 'Assistant Professor',
    subjects TEXT DEFAULT '[]',
    joining_date TEXT DEFAULT '2020-08-01'
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER REFERENCES students(id),
    subject TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('present','absent','late')),
    marked_by INTEGER REFERENCES staff(id),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER REFERENCES students(id),
    subject TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    semester INTEGER NOT NULL,
    internal INTEGER DEFAULT 0,
    external INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    max_marks INTEGER DEFAULT 150,
    grade TEXT DEFAULT 'B',
    gpa REAL DEFAULT 7.0
  );

  CREATE TABLE IF NOT EXISTS fees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER REFERENCES students(id),
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    due_date TEXT NOT NULL,
    category TEXT DEFAULT 'Academic',
    status TEXT DEFAULT 'Pending' CHECK(status IN ('Paid','Pending','Overdue')),
    paid_on TEXT
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    venue TEXT NOT NULL,
    type TEXT NOT NULL,
    seats INTEGER DEFAULT 100,
    filled INTEGER DEFAULT 0,
    emoji TEXT DEFAULT '📅',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS event_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER REFERENCES events(id),
    student_id INTEGER REFERENCES students(id),
    registered_at TEXT DEFAULT (datetime('now')),
    UNIQUE(event_id, student_id)
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    target TEXT DEFAULT 'All Students',
    urgent INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER REFERENCES students(id),
    staff_id INTEGER REFERENCES staff(id),
    subject TEXT NOT NULL,
    aspect TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comments TEXT,
    anonymous INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS leave_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER REFERENCES staff(id),
    type TEXT NOT NULL,
    from_date TEXT NOT NULL,
    to_date TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending','Approved','Rejected')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER REFERENCES staff(id),
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    filename TEXT NOT NULL,
    size TEXT DEFAULT '1.2 MB',
    uploaded_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS timetable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER REFERENCES staff(id),
    day TEXT NOT NULL,
    period INTEGER NOT NULL,
    subject TEXT NOT NULL,
    UNIQUE(staff_id, day, period)
  );
`)

module.exports = db
