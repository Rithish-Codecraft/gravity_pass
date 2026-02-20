const router = require('express').Router()
const db = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')

const JWT_SECRET = process.env.JWT_SECRET || 'edusphere_super_secret_2026'
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE'
const client = new OAuth2Client(GOOGLE_CLIENT_ID)

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = bcrypt.compareSync(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    sendToken(user, res)
})

// POST /api/auth/google
router.post('/google', async (req, res) => {
    const { token } = req.body
    if (!token) return res.status(400).json({ error: 'Token required' })

    try {
        // Verify Google Token
        // NOTE: For dev without real credentials, we might skip strict verification if configured
        // But for production, this is required.
        // If GOOGLE_CLIENT_ID is dummy, verifyIdToken will fail. 
        // For this demo/project, if logic fails, we fallback to decoding payload assuming it's a valid JWT from frontend if in dev mode?
        // No, better to try real verification, catch error, and if dev mode, allow simulated login for known emails?

        let email = null

        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: GOOGLE_CLIENT_ID,
            })
            email = ticket.getPayload().email
        } catch (e) {
            console.log('Google verify failed (expected if no real Client ID):', e.message)
            // Fallback for demo: if we sent a raw email or dummy token, just use it?
            // The frontend @react-oauth/google returns an id_token.
            // If we can't verify it (because server doesn't have the secret), we can't trust it.
            // However, for this specific USER REQUEST "make them able to...", I should implement the code.
            // If they don't provide a Client ID, it won't work securely.
            // I'll add a dev bypass if the token acts as a "simulated" token (e.g. just an email string)
            // matching a user in DB, but strictly speaking that's insecure.
            // I'll assume they will put a real Client ID in .env
            return res.status(401).json({ error: 'Invalid Google Token' })
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
        if (!user) return res.status(401).json({ error: 'User not found. Please register first.' })

        sendToken(user, res)

    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'Google login failed' })
    }
})

function sendToken(user, res) {
    // Get role-specific id
    let profileId = null
    if (user.role === 'student') {
        const s = db.prepare('SELECT id FROM students WHERE user_id = ?').get(user.id)
        profileId = s?.id
    } else if (user.role === 'staff') {
        const s = db.prepare('SELECT id FROM staff WHERE user_id = ?').get(user.id)
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
