const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 4000
const isProd = process.env.NODE_ENV === 'production'

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
    origin: isProd
        ? (process.env.FRONTEND_URL || '').split(',').map(u => u.trim()).filter(Boolean)
        : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'))
app.use('/api/students', require('./routes/students'))
app.use('/api/staff', require('./routes/staff'))
app.use('/api/attendance', require('./routes/attendance'))
app.use('/api/results', require('./routes/results'))
app.use('/api/fees', require('./routes/fees'))
app.use('/api/events', require('./routes/events'))
app.use('/api/announcements', require('./routes/announcements'))
app.use('/api/feedback', require('./routes/feedback'))
app.use('/api/leave', require('./routes/leave'))
app.use('/api/notes', require('./routes/notes'))
app.use('/api/admin', require('./routes/admin'))

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// ─── Serve React frontend in production ──────────────────────────────────────
if (isProd) {
    const distPath = path.join(__dirname, '..', 'dist')
    app.use(express.static(distPath))
    // SPA fallback — React Router handles client-side routing
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'))
    })
}

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err.message)
    res.status(500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
    console.log(`EduSphere ${isProd ? 'Production' : 'Dev'} API — http://localhost:${PORT}`)
    if (isProd) console.log('Frontend served from dist/')
})
