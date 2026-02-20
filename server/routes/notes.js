const router = require('express').Router()
const db = require('../db')
const auth = require('../middleware/auth')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }) // 50MB

// GET /api/notes
router.get('/', auth, (req, res) => {
    if (req.user.role !== 'staff' && req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' })

    let notes
    if (req.user.role === 'staff') {
        const staff = db.prepare('SELECT id FROM staff WHERE user_id = ?').get(req.user.id)
        notes = db.prepare(`
      SELECT n.*, u.name as uploader FROM notes n JOIN staff s ON n.staff_id=s.id JOIN users u ON s.user_id=u.id
      WHERE n.staff_id = ? ORDER BY n.uploaded_at DESC
    `).all(staff.id)
    } else {
        notes = db.prepare(`
      SELECT n.*, u.name as uploader FROM notes n JOIN staff s ON n.staff_id=s.id JOIN users u ON s.user_id=u.id
      ORDER BY n.uploaded_at DESC
    `).all()
    }
    const { subject } = req.query
    if (subject && subject !== 'All') notes = notes.filter(n => n.subject === subject)
    res.json(notes)
})

// POST /api/notes  (staff only, multipart)
router.post('/', auth, upload.single('file'), (req, res) => {
    if (req.user.role !== 'staff') return res.status(403).json({ error: 'Only staff can upload notes' })
    const staff = db.prepare('SELECT id FROM staff WHERE user_id = ?').get(req.user.id)
    const { title, subject } = req.body
    if (!title || !subject || !req.file) return res.status(400).json({ error: 'title, subject and file required' })

    const sizeKB = req.file.size / 1024
    const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${Math.round(sizeKB)} KB`

    const info = db.prepare('INSERT INTO notes (staff_id, title, subject, filename, size) VALUES (?,?,?,?,?)').run(
        staff.id, title, subject, req.file.filename, sizeStr
    )
    res.json({ id: info.lastInsertRowid, title, subject, filename: req.file.filename, size: sizeStr, message: 'Note uploaded!' })
})

module.exports = router
