import React, { useState, useRef, useEffect } from 'react'
import { Camera, UserPlus, CheckCircle, AlertCircle, Users, RefreshCw } from 'lucide-react'
import { LayoutDashboard, FileText, Calendar, Bell } from 'lucide-react'
import BottomNav from '../../components/BottomNav'
import PageHeader from '../../components/PageHeader'
import axios from 'axios'

const navItems = [
    { label: 'Home', icon: LayoutDashboard, path: '/staff' },
    { label: 'Attend', icon: Camera, path: '/staff/attendance' },
    { label: 'Notes', icon: FileText, path: '/staff/notes' },
    { label: 'Timetable', icon: Calendar, path: '/staff/timetable' },
    { label: 'More', icon: Bell, path: '/staff/announcements' },
]

export default function FaceRegistry() {
    const [mode, setMode] = useState('register') // 'register' | 'live'
    const [studentId, setStudentId] = useState('')
    const [subject, setSubject] = useState('AI & Data Science')
    const [status, setStatus] = useState(null)   // { type: 'success'|'error', message }
    const [stats, setStats] = useState(null)
    const [streaming, setStreaming] = useState(false)
    const [interval_, setInterval_] = useState(null)
    const videoRef = useRef(null)
    const canvasRef = useRef(null)

    useEffect(() => {
        fetchStats()
        return () => { if (interval_) clearInterval(interval_) }
    }, [])

    const fetchStats = async () => {
        try {
            const { data } = await axios.get('/ml/face/stats')
            setStats(data)
        } catch (e) { /* ML service offline */ }
    }

    const captureAndSend = async (endpoint, formData) => {
        const canvas = canvasRef.current
        const video = videoRef.current
        if (!canvas || !video) return null

        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 480
        canvas.getContext('2d').drawImage(video, 0, 0)

        return new Promise(resolve => canvas.toBlob(async blob => {
            formData.append('image', blob, 'frame.jpg')
            try {
                const { data } = await axios.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                resolve(data)
            } catch (e) {
                resolve({ success: false, message: e.response?.data?.error || 'Request failed' })
            }
        }, 'image/jpeg', 0.85))
    }

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
            videoRef.current.srcObject = stream
            setStreaming(true)
        } catch (e) {
            setStatus({ type: 'error', message: 'Camera access denied. Please allow camera permissions.' })
        }
    }

    const stopCamera = () => {
        const stream = videoRef.current?.srcObject
        if (stream) stream.getTracks().forEach(t => t.stop())
        setStreaming(false)
        if (interval_) { clearInterval(interval_); setInterval_(null) }
    }

    const registerFace = async () => {
        if (!studentId) { setStatus({ type: 'error', message: 'Enter Student ID first' }); return }
        const fd = new FormData()
        fd.append('student_id', studentId)
        const res = await captureAndSend('/ml/face/register', fd)
        if (res) {
            setStatus({ type: res.success ? 'success' : 'error', message: res.message })
            if (res.success) fetchStats()
        }
    }

    const startLiveAttendance = () => {
        if (interval_) return
        const iv = setInterval(async () => {
            const fd = new FormData()
            fd.append('subject', subject)
            const res = await captureAndSend('/ml/face/recognise', fd)
            if (res?.success && !res.already_marked) {
                setStatus({ type: 'success', message: `✅ ${res.message} (${(res.confidence * 100).toFixed(0)}% confidence)` })
            } else if (res && !res.success && res.message !== 'No face detected') {
                setStatus({ type: 'error', message: res.message })
            }
        }, 3000)   // scan every 3 seconds
        setInterval_(iv)
        setStatus({ type: 'success', message: '🎥 Live attendance scan started — hold steady...' })
    }

    const stopLiveAttendance = () => {
        if (interval_) { clearInterval(interval_); setInterval_(null) }
        setStatus({ type: 'success', message: 'Live attendance stopped' })
    }

    return (
        <div className="page-wrapper">
            <PageHeader title="Face Attendance" subtitle="AI-powered face recognition" role="staff" />
            <div className="page-content" style={{ paddingBottom: 100 }}>

                {/* Stats */}
                {stats && (
                    <div className="grid-2 animate-fadeInUp" style={{ marginBottom: 16 }}>
                        <div className="stat-card" style={{ borderLeft: '3px solid var(--accent-teal)' }}>
                            <div className="stat-label">Registered</div>
                            <div className="stat-number" style={{ color: 'var(--accent-teal)' }}>{stats.registered_faces}</div>
                        </div>
                        <div className="stat-card" style={{ borderLeft: '3px solid var(--accent-gold)' }}>
                            <div className="stat-label">Coverage</div>
                            <div className="stat-number" style={{ color: 'var(--accent-gold)' }}>{stats.coverage_pct}%</div>
                        </div>
                    </div>
                )}

                {/* Mode Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {[['register', '👤 Register Face'], ['live', '📹 Live Attendance']].map(([m, label]) => (
                        <button key={m} onClick={() => { setMode(m); setStatus(null) }} style={{
                            flex: 1, padding: '10px 0', borderRadius: 12, fontWeight: 600, fontSize: '0.82rem',
                            border: 'none', cursor: 'pointer',
                            background: mode === m ? 'var(--accent-purple)' : 'rgba(255,255,255,0.06)',
                            color: mode === m ? '#fff' : 'var(--text-secondary)',
                        }}>{label}</button>
                    ))}
                </div>

                {/* Status */}
                {status && (
                    <div className="animate-fadeInUp" style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, marginBottom: 16,
                        background: status.type === 'success' ? 'rgba(0,212,170,0.12)' : 'rgba(255,107,157,0.12)',
                        border: `1px solid ${status.type === 'success' ? 'var(--accent-teal)' : 'var(--accent-pink)'}30`,
                    }}>
                        {status.type === 'success' ? <CheckCircle size={16} color="var(--accent-teal)" /> : <AlertCircle size={16} color="var(--accent-pink)" />}
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{status.message}</div>
                    </div>
                )}

                {/* Camera View */}
                <div className="glass-card animate-fadeInUp" style={{ padding: 0, overflow: 'hidden', marginBottom: 16, position: 'relative' }}>
                    <video ref={videoRef} autoPlay playsInline muted
                        style={{
                            width: '100%', display: 'block', maxHeight: 280, objectFit: 'cover',
                            background: '#0a0a1a', borderRadius: 16
                        }} />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    {!streaming && (
                        <div style={{
                            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', borderRadius: 16
                        }}>
                            <Camera size={40} color="rgba(255,255,255,0.3)" style={{ marginBottom: 12 }} />
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Camera not started</div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                {mode === 'register' ? (
                    <div className="glass-card" style={{ padding: 16 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Student ID</div>
                        <input
                            type="number" placeholder="Enter student database ID..."
                            value={studentId} onChange={e => setStudentId(e.target.value)}
                            style={{
                                width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                                padding: '8px 12px', color: 'var(--text-primary)', marginBottom: 12
                            }}
                        />
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={streaming ? stopCamera : startCamera} style={{
                                flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600,
                                background: streaming ? 'rgba(255,107,157,0.2)' : 'rgba(0,212,170,0.2)',
                                color: streaming ? 'var(--accent-pink)' : 'var(--accent-teal)',
                            }}>{streaming ? '⏹ Stop Camera' : '▶ Start Camera'}</button>
                            <button onClick={registerFace} disabled={!streaming} style={{
                                flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600,
                                background: 'var(--accent-purple)', color: '#fff', opacity: streaming ? 1 : 0.5,
                            }}>📸 Register</button>
                        </div>
                    </div>
                ) : (
                    <div className="glass-card" style={{ padding: 16 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Subject</div>
                        <input value={subject} onChange={e => setSubject(e.target.value)}
                            style={{
                                width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                                padding: '8px 12px', color: 'var(--text-primary)', marginBottom: 12
                            }}
                        />
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={streaming ? stopCamera : startCamera} style={{
                                flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600,
                                background: streaming ? 'rgba(255,107,157,0.2)' : 'rgba(0,212,170,0.2)',
                                color: streaming ? 'var(--accent-pink)' : 'var(--accent-teal)',
                            }}>{streaming ? '⏹ Stop' : '▶ Camera'}</button>
                            {interval_
                                ? <button onClick={stopLiveAttendance} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, background: 'rgba(255,107,157,0.2)', color: 'var(--accent-pink)' }}>⏸ Stop Scan</button>
                                : <button onClick={startLiveAttendance} disabled={!streaming} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, background: 'var(--accent-purple)', color: '#fff', opacity: streaming ? 1 : 0.5 }}>🤖 Start AI Scan</button>
                            }
                        </div>
                        <div style={{ marginTop: 12, padding: 10, background: 'rgba(108,99,255,0.08)', borderRadius: 8, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            AI scans for faces every 3 seconds and marks attendance automatically. No duplicates per day.
                        </div>
                    </div>
                )}
            </div>
            <BottomNav role="staff" items={navItems} />
        </div>
    )
}
