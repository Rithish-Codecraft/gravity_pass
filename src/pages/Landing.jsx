import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Users, Shield, Eye, EyeOff, Loader } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { login, getUser } from '../api/auth'

function ParticleCanvas() {
    const canvasRef = useRef(null)
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        let animId
        const particles = []
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
        resize()
        window.addEventListener('resize', resize)
        for (let i = 0; i < 60; i++) particles.push({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            r: Math.random() * 1.5 + 0.5, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
            alpha: Math.random() * 0.6 + 0.2,
        })
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy
                if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0
                if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(108,99,255,${p.alpha})`; ctx.fill()
            })
            animId = requestAnimationFrame(draw)
        }
        draw()
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId) }
    }, [])
    return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
}

const roles = [
    { id: 'student', icon: GraduationCap, label: 'Student', color: 'var(--accent-teal)', email: 'arjun@edu.ac.in', path: '/student' },
    { id: 'staff', icon: Users, label: 'Staff', color: 'var(--accent-purple)', email: 'priya@edu.ac.in', path: '/staff' },
    { id: 'admin', icon: Shield, label: 'Admin', color: 'var(--accent-gold)', email: 'admin@edu.ac.in', path: '/admin' },
]

export default function Landing() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [hinted, setHinted] = useState(null)

    // If already logged in, redirect
    useEffect(() => {
        const user = getUser()
        if (user?.role) navigate(`/${user.role}`, { replace: true })
    }, [])

    const handleLogin = async (e) => {
        e?.preventDefault()
        if (!email || !password) { setError('Enter email and password'); return }
        setLoading(true); setError('')
        try {
            const user = await login(email, password)
            navigate(`/${user.role}`)
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Check credentials.')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true); setError('')
        try {
            const { data } = await axios.post('/api/auth/google', { token: credentialResponse.credential })
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            navigate(`/${data.user.role}`)
        } catch (err) {
            setError(err.response?.data?.error || 'Google Login failed.')
        } finally {
            setLoading(false)
        }
    }

    const quickLogin = (role) => {
        setEmail(role.email)
        setPassword(role.id === 'admin' ? 'admin123' : role.id === 'staff' ? 'staff123' : 'student123')
        setHinted(role.id)
    }

    return (
        <div style={{ minHeight: '100dvh', position: 'relative', overflow: 'hidden', background: 'var(--bg-primary)' }}>
            <ParticleCanvas />

            {/* Gradient orbs */}
            <div style={{ position: 'fixed', top: -120, left: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 420, margin: '0 auto', padding: '40px 20px 40px' }}>
                {/* Logo */}
                <div className="animate-fadeInUp" style={{ textAlign: 'center', marginBottom: 36 }}>
                    <img
                        src="/logo.png"
                        alt="Gravity Pass Logo"
                        style={{
                            height: 80,
                            margin: '0 auto 16px',
                            display: 'block',
                            animation: 'float 3s ease-in-out infinite',
                        }}
                    />
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>College ERP · Sign in to continue</div>
                </div>

                {/* Login form */}
                <form onSubmit={handleLogin} className="animate-fadeInUp delay-1 glass-card" style={{ padding: 24, marginBottom: 20 }}>
                    <div style={{ marginBottom: 14 }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
                        <input
                            className="input-field"
                            type="email"
                            placeholder="your@edu.ac.in"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError('') }}
                            autoComplete="email"
                            required
                        />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                className="input-field"
                                type={showPass ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError('') }}
                                autoComplete="current-password"
                                style={{ paddingRight: 44 }}
                                required
                            />
                            <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="animate-scaleIn" style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(255,107,157,0.12)', border: '1px solid rgba(255,107,157,0.3)', borderRadius: 10, fontSize: '0.82rem', color: 'var(--accent-pink)' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-full btn-lg"
                        style={{
                            background: 'linear-gradient(135deg, #6c63ff, #9c6cff)',
                            color: '#fff', justifyContent: 'center',
                            boxShadow: '0 8px 24px rgba(108,99,255,0.35)',
                            opacity: loading ? 0.8 : 1,
                        }}
                    >
                        {loading ? <><Loader size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> Signing in...</> : 'Sign In'}
                    </button>
                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
                        {/* <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Login Failed')}
                            theme="filled_black"
                            shape="pill"
                            text="signin_with"
                        /> */}
                    </div>
                </form>

                {/* Quick demo login buttons */}
                <div className="animate-fadeInUp delay-2">
                    <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                        — Quick Demo Login —
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {roles.map(role => (
                            <button
                                key={role.id}
                                onClick={() => quickLogin(role)}
                                style={{
                                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                    padding: '12px 8px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.25s',
                                    background: hinted === role.id ? `${role.color}20` : 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${hinted === role.id ? role.color + '55' : 'rgba(255,255,255,0.08)'}`,
                                    color: hinted === role.id ? role.color : 'var(--text-secondary)',
                                }}
                                onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                                onMouseOut={e => (e.currentTarget.style.transform = '')}
                            >
                                <role.icon size={20} color={role.color} />
                                <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{role.label}</span>
                            </button>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 12, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        Click a role above to auto-fill demo credentials, then Sign In
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: 32, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    EduSphere v2.0 · Secured with JWT · SQLite DB
                </div>
            </div>
        </div >
    )
}
