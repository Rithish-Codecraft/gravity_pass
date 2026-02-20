import React, { useState, useRef, useEffect } from 'react'
import { LayoutDashboard, Camera, BookOpen, Star, Calendar, CheckCircle, MapPin, Wifi, RefreshCw, Clock } from 'lucide-react'
import BottomNav from '../../components/BottomNav'
import PageHeader from '../../components/PageHeader'
import Chatbot from '../../components/Chatbot'

const navItems = [
    { label: 'Home', icon: LayoutDashboard, path: '/student' },
    { label: 'Attendance', icon: Camera, path: '/student/face-attendance' },
    { label: 'Results', icon: BookOpen, path: '/student/results' },
    { label: 'Feedback', icon: Star, path: '/student/feedback' },
    { label: 'More', icon: Calendar, path: '/student/events' },
]

const attendanceLog = [
    { date: 'Feb 20, 2026', time: '9:02 AM', subject: 'Data Structures', status: 'Present', room: 'Lab 2' },
    { date: 'Feb 20, 2026', time: '11:05 AM', subject: 'Algorithms', status: 'Present', room: 'Room 301' },
    { date: 'Feb 19, 2026', time: '9:00 AM', subject: 'Data Structures', status: 'Present', room: 'Lab 2' },
    { date: 'Feb 19, 2026', time: '2:10 PM', subject: 'DBMS', status: 'Late', room: 'Room 205' },
    { date: 'Feb 18, 2026', time: '11:00 AM', subject: 'Algorithms', status: 'Absent', room: 'Room 301' },
    { date: 'Feb 18, 2026', time: '3:00 PM', subject: 'Networks', status: 'Present', room: 'Room 108' },
]

export default function StudentFaceAttendance() {
    const videoRef = useRef(null)
    const [cameraOn, setCameraOn] = useState(false)
    const [scanning, setScanning] = useState(false)
    const [detected, setDetected] = useState(false)
    const [punched, setPunched] = useState(false)
    const [stream, setStream] = useState(null)
    const [toast, setToast] = useState(null)
    const [cameraError, setCameraError] = useState(false)

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

    const startCamera = async () => {
        try {
            setCameraError(false)
            const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
            setStream(s)
            if (videoRef.current) videoRef.current.srcObject = s
            setCameraOn(true)
            // Simulate face detection after 2s
            setTimeout(() => setDetected(true), 2200)
        } catch (err) {
            setCameraError(true)
            setCameraOn(true) // Show UI anyway with demo
            setTimeout(() => setDetected(true), 2200)
        }
    }

    const stopCamera = () => {
        stream?.getTracks().forEach(t => t.stop())
        setStream(null)
        setCameraOn(false)
        setDetected(false)
        setScanning(false)
        setPunched(false)
    }

    const handlePunchIn = () => {
        if (!detected) { showToast('⚠️ Face not detected yet!'); return }
        setScanning(true)
        setTimeout(() => {
            setScanning(false)
            setPunched(true)
            showToast('✅ Attendance marked successfully!')
        }, 1800)
    }

    useEffect(() => () => stream?.getTracks().forEach(t => t.stop()), [stream])

    const statusColors = { Present: 'var(--accent-teal)', Absent: 'var(--accent-pink)', Late: 'var(--accent-gold)' }

    return (
        <div className="page-wrapper">
            {toast && <div className="toast">{toast}</div>}
            <PageHeader title="Face Attendance" subtitle="Biometric Punch-In" role="student" back="/student" />
            <div className="page-content" style={{ paddingBottom: 100 }}>

                {/* Camera view */}
                {!cameraOn ? (
                    <div className="animate-fadeInUp" style={{ textAlign: 'center', paddingTop: 40, marginBottom: 24 }}>
                        <div style={{
                            width: 120, height: 120, borderRadius: '50%',
                            background: 'rgba(0,212,170,0.1)',
                            border: '2px dashed var(--accent-teal)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px',
                            animation: 'float 3s ease-in-out infinite',
                        }}>
                            <Camera size={48} color="var(--accent-teal)" strokeWidth={1.5} />
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>Ready to check in?</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 24 }}>
                            Your face will be securely scanned to mark attendance
                        </div>
                        <button className="btn btn-teal btn-lg" style={{ justifyContent: 'center', minWidth: 200 }} onClick={startCamera}>
                            <Camera size={20} /> Start Camera
                        </button>
                    </div>
                ) : (
                    <div className="animate-scaleIn" style={{ marginBottom: 20 }}>
                        <div className="camera-frame" style={{ borderRadius: 20 }}>
                            {!cameraError ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{
                                    width: '100%', height: '100%',
                                    background: 'linear-gradient(135deg, #0a0a1a, #1a1a2e)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexDirection: 'column', gap: 12,
                                }}>
                                    <div style={{ fontSize: '4rem' }}>👤</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Demo Mode</div>
                                </div>
                            )}

                            {/* Face overlay */}
                            <div className="face-overlay">
                                <div className="face-box">
                                    <div className="scan-line" />
                                    <div className="corner tl" /><div className="corner tr" />
                                    <div className="corner bl" /><div className="corner br" />
                                    {scanning && (
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            borderRadius: '50% / 40%',
                                            background: 'rgba(0,212,170,0.1)',
                                            animation: 'pulse-glow 0.6s infinite',
                                        }} />
                                    )}
                                </div>
                            </div>

                            {/* Status overlay top */}
                            <div style={{
                                position: 'absolute', bottom: 16, left: 16, right: 16,
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                                <div style={{
                                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                                    borderRadius: 100, padding: '6px 14px', fontSize: '0.75rem',
                                    display: 'flex', alignItems: 'center', gap: 6,
                                }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: detected ? 'var(--accent-teal)' : 'var(--accent-gold)', animation: 'pulse-glow 1s infinite' }} />
                                    {detected ? '✅ Face Detected' : '🔍 Scanning...'}
                                </div>
                                <button onClick={stopCamera} style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: 'none', color: '#fff', borderRadius: 100, padding: '6px 14px', cursor: 'pointer', fontSize: '0.75rem' }}>
                                    ✕ Cancel
                                </button>
                            </div>
                        </div>

                        {/* Info row */}
                        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                            <div className="glass-card" style={{ flex: 1, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <MapPin size={14} color="var(--accent-teal)" />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lab 2, Block A</span>
                            </div>
                            <div className="glass-card" style={{ flex: 1, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Clock size={14} color="var(--accent-purple)" />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>9:02 AM</span>
                            </div>
                        </div>

                        {/* Punch in */}
                        {!punched ? (
                            <button
                                className={`btn btn-full btn-lg animate-fadeInUp ${detected ? 'btn-teal' : 'btn-ghost'}`}
                                style={{ marginTop: 14, opacity: detected ? 1 : 0.6 }}
                                onClick={handlePunchIn}
                                disabled={!detected || scanning}
                            >
                                {scanning
                                    ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Verifying...</>
                                    : <><Camera size={18} /> {detected ? 'Punch In' : 'Waiting for face...'}</>
                                }
                            </button>
                        ) : (
                            <div className="glass-card animate-scaleIn" style={{ marginTop: 14, padding: 20, textAlign: 'center', borderColor: 'rgba(0,212,170,0.3)' }}>
                                <CheckCircle size={40} color="var(--accent-teal)" style={{ margin: '0 auto 10px' }} />
                                <div style={{ fontWeight: 700, fontSize: '1rem' }}>Attendance Marked! ✅</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 4 }}>Data Structures · 9:02 AM</div>
                            </div>
                        )}
                    </div>
                )}

                <div className="divider" />

                {/* Attendance Log */}
                <div className="animate-fadeInUp delay-2">
                    <div className="section-title">Attendance Log</div>
                    <div className="flex-col" style={{ gap: 10 }}>
                        {attendanceLog.map((log, i) => (
                            <div key={i} className="list-item" style={{ borderLeft: `3px solid ${statusColors[log.status]}` }}>
                                <div style={{
                                    width: 38, height: 38, borderRadius: 10,
                                    background: statusColors[log.status] + '20',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 800, fontSize: '0.72rem',
                                    color: statusColors[log.status],
                                }}>
                                    {log.status[0]}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="list-item-title">{log.subject}</div>
                                    <div className="list-item-sub">{log.date} · {log.time}</div>
                                </div>
                                <span className={`badge ${log.status === 'Present' ? 'badge-teal' : log.status === 'Late' ? 'badge-gold' : 'badge-pink'}`}>
                                    {log.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <BottomNav role="student" items={navItems} />
            <Chatbot accentColor="var(--accent-teal)" />
        </div>
    )
}
