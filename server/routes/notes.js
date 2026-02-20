const router = require('express').Router()
const { query } = require('../db')
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
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } })

// GET /api/notes
router.get('/', auth, async (req, res) => {
    if (req.user.role !== 'staff' && req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' })
    try {
        let notes
        if (req.user.role === 'staff') {
            const [staff] = await query('SELECT id FROM staff WHERE user_id = $1', [req.user.id])
            notes = await query(`
                SELECT n.*, u.name as uploader FROM notes n
                JOIN staff s ON n.staff_id=s.id JOIN users u ON s.user_id=u.id
                WHERE n.staff_id = $1 ORDER BY n.uploaded_at DESC
            `, [staff.id])
        } else {
            notes = await query(`
                SELECT n.*, u.name as uploader FROM notes n
                JOIN staff s ON n.staff_id=s.id JOIN users u ON s.user_id=u.id
                ORDER BY n.uploaded_at DESC
            `)
        }
        const { subject } = req.query
        if (subject && subject !== 'All') notes = notes.filter(n => n.subject === subject)
        res.json(notes)
    } catch (e) { res.status(500).json({ error: e.message }) }
})

// POST /api/notes
router.post('/', auth, upload.single('file'), async (req, res) => {
    if (req.user.role !== 'staff') return res.status(403).json({ error: 'Only staff can upload notes' })
    try {
        const [staff] = await query('SELECT id FROM staff WHERE user_id = $1', [req.user.id])
        const { title, subject } = req.body
        if (!title || !subject || !req.file) return res.status(400).json({ error: 'title, subject and file required' })

        const sizeKB = req.file.size / 1024
        const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${Math.round(sizeKB)} KB`

        const [row] = await query(
            'INSERT INTO notes (staff_id, title, subject, filename, size) VALUES ($1,$2,$3,$4,$5) RETURNING id',
            [staff.id, title, subject, req.file.filename, sizeStr]
        )
        res.json({ id: row.id, title, subject, filename: req.file.filename, size: sizeStr, message: 'Note uploaded!' })
    } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
