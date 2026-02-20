const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'edusphere_super_secret_2026'

module.exports = (req, res, next) => {
    const auth = req.headers.authorization
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' })
    }
    const token = auth.slice(7)
    try {
        const payload = jwt.verify(token, JWT_SECRET)
        req.user = payload   // { id, email, role, name }
        next()
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' })
    }
}
