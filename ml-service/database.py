"""
database.py — SQLite connection helper (shared with the Express backend)
All SELECT/INSERT operations use the same edusphere.db file.
"""
import sqlite3
import os
from config import Config


def get_connection():
    """Return a SQLite connection with row_factory for dict-like access."""
    conn = sqlite3.connect(Config.DB_PATH)
    conn.row_factory = sqlite3.Row          # row['column_name'] access
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn


def query(sql: str, params=(), one=False):
    """Execute a SELECT query and return list of dicts (or single dict)."""
    conn = get_connection()
    try:
        cur = conn.execute(sql, params)
        rows = [dict(r) for r in cur.fetchall()]
        return rows[0] if (one and rows) else rows
    finally:
        conn.close()


def execute(sql: str, params=()):
    """Execute INSERT / UPDATE / DELETE and return lastrowid."""
    conn = get_connection()
    try:
        cur = conn.execute(sql, params)
        conn.commit()
        return cur.lastrowid
    finally:
        conn.close()


def executemany(sql: str, params_list):
    """Batch INSERT/UPDATE."""
    conn = get_connection()
    try:
        conn.executemany(sql, params_list)
        conn.commit()
    finally:
        conn.close()


def ensure_ml_tables():
    """Create AI-specific tables if they don't exist yet."""
    conn = get_connection()
    conn.executescript("""
        -- Face embeddings: one row per registered student
        CREATE TABLE IF NOT EXISTS face_embeddings (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id  INTEGER UNIQUE REFERENCES students(id) ON DELETE CASCADE,
            embedding   BLOB NOT NULL,       -- numpy array pickled
            image_path  TEXT,
            registered_at TEXT DEFAULT (datetime('now'))
        );

        -- Extended student performance fields (added by ML pipeline)
        CREATE TABLE IF NOT EXISTS ml_performance (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id      INTEGER UNIQUE REFERENCES students(id),
            internal_avg    REAL DEFAULT 0,
            external_avg    REAL DEFAULT 0,
            backlog_count   INTEGER DEFAULT 0,
            attendance_pct  REAL DEFAULT 0,
            pass_prob       REAL DEFAULT 0,   -- from ML model (0-1)
            risk_level      TEXT DEFAULT 'Low', -- Low / Medium / High
            placement_prob  REAL DEFAULT 0,
            updated_at      TEXT DEFAULT (datetime('now'))
        );

        -- Placement records
        CREATE TABLE IF NOT EXISTS placements (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER REFERENCES students(id),
            company    TEXT NOT NULL,
            package    REAL,              -- in LPA
            role       TEXT,
            placed_on  TEXT DEFAULT (datetime('now'))
        );

        -- Resume keywords log
        CREATE TABLE IF NOT EXISTS resume_analyses (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id  INTEGER REFERENCES students(id),
            keywords    TEXT,             -- JSON array
            score       REAL DEFAULT 0,
            analysed_at TEXT DEFAULT (datetime('now'))
        );
    """)
    conn.commit()
    conn.close()
