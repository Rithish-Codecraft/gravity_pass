const router = require('express').Router()
const { query } = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')

const JWT_SECRET = process.env.JWT_SECRET || 'edusphere_super_secret_2026'
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE'
const client = new OAuth2Client(GOOGLE_CLIENT_ID)

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    try {
        const [user] = await query('SELECT * FROM users WHERE email = $1', [email])
        if (!user) return res.status(401).json({ error: 'Invalid credentials' })

        const valid = bcrypt.compareSync(password, user.password_hash)
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

        await sendToken(user, res)
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'Login failed' })
    }
})

// POST /api/auth/google
router.post('/google', async (req, res) => {
    const { token } = req.body
    if (!token) return res.status(400).json({ error: 'Token required' })

    try {
        let email = null
        try {
            const ticket = await client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID })
            email = ticket.getPayload().email
        } catch (e) {
            console.log('Google verify failed:', e.message)
            return res.status(401).json({ error: 'Invalid Google Token' })
        }

        const [user] = await query('SELECT * FROM users WHERE email = $1', [email])
        if (!user) return res.status(401).json({ error: 'User not found. Please register first.' })

        await sendToken(user, res)
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'Google login failed' })
    }
})

async function sendToken(user, res) {
    let profileId = null
    if (user.role === 'student') {
        const [s] = await query('SELECT id FROM students WHERE user_id = $1', [user.id])
        profileId = s?.id
    } else if (user.role === 'staff') {
        const [s] = await query('SELECT id FROM staff WHERE user_id = $1', [user.id])
        profileId = s?.id
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name, dept: user.dept, profileId },
        JWT_SECRET,
        { expiresIn: '7d' }
    )

    res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, dept: user.dept, profileId }
    })
}

module.exports = router
