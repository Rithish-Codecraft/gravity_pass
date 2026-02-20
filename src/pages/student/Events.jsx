import React, { useState } from 'react'
import { LayoutDashboard, Camera, BookOpen, Star, Calendar, Bell, MapPin, Clock, Users, ChevronRight, Filter } from 'lucide-react'
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

const events = [
    { id: 1, title: 'Technical Symposium – TechFest 2026', date: 'Mar 14, 2026', time: '9:00 AM', venue: 'Main Auditorium', type: 'Technical', registered: true, seats: 200, filled: 178, emoji: '💻' },
    { id: 2, title: 'Inter-College Hackathon', date: 'Mar 20–21, 2026', time: '8:00 AM', venue: 'Innovation Lab', type: 'Competition', registered: false, seats: 50, filled: 42, emoji: '🚀' },
    { id: 3, title: 'Cultural Fest – Kaleidoscope', date: 'Apr 2, 2026', time: '5:00 PM', venue: 'Open Air Theatre', type: 'Cultural', registered: false, seats: 1000, filled: 650, emoji: '🎭' },
    { id: 4, title: 'Campus Placement Drive – TCS', date: 'Mar 25, 2026', time: '10:00 AM', venue: 'Seminar Hall 3', type: 'Placement', registered: true, seats: 80, filled: 78, emoji: '💼' },
    { id: 5, title: 'Blood Donation Camp', date: 'Mar 10, 2026', time: '9:00 AM', venue: 'Health Center', type: 'Social', registered: false, seats: 100, filled: 32, emoji: '🩸' },
]

const notices = [
    { title: 'End Semester Exam Schedule Released', date: 'Feb 18', urgent: true },
    { title: 'Library Renovation – Partial Closure Till March 5', date: 'Feb 15', urgent: false },
    { title: 'NPTEL Certification Registration Open', date: 'Feb 12', urgent: false },
    { title: 'Campus Wi-Fi Upgrade – Scheduled Downtime Feb 22', date: 'Feb 10', urgent: true },
]

const typeColors = { Technical: '#6c63ff', Competition: '#00d4aa', Cultural: '#f7c948', Placement: '#ff6b9d', Social: '#ff8a65' }

export default function StudentEvents() {
    const [registrations, setRegistrations] = useState(
        events.reduce((acc, e) => ({ ...acc, [e.id]: e.registered }), {})
    )
    const [activeTab, setActiveTab] = useState('Events')
    const [toast, setToast] = useState(null)
    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

    const toggleReg = (id, title) => {
        const wasReg = registrations[id]
        setRegistrations(r => ({ ...r, [id]: !r[id] }))
        showToast(wasReg ? `✅ Unregistered from ${title}` : `🎉 Registered for ${title}!`)
    }

    return (
        <div className="page-wrapper">
            {toast && <div className="toast">{toast}</div>}
            <PageHeader title="Events & Notices" subtitle="Campus Happenings" role="student" back="/student" />
            <div className="page-content" style={{ paddingBottom: 100 }}>

                <div className="tab-bar animate-fadeInUp" style={{ marginBottom: 20 }}>
                    {['Events', 'Notices'].map(tab => (
                        <button key={tab} className={`tab-pill ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                            {tab === 'Events' ? '📅' : '📢'} {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'Events' && (
                    <div className="animate-fadeIn flex-col" style={{ gap: 14 }}>
                        {events.map(event => {
                            const isReg = registrations[event.id]
                            const fillPct = Math.round((event.filled / event.seats) * 100)
                            const isFull = event.filled >= event.seats
                            return (
                                <div key={event.id} className="glass-card" style={{ padding: 16, borderLeft: `3px solid ${typeColors[event.type] || '#6c63ff'}` }}>
                                    <div className="flex-between" style={{ marginBottom: 10 }}>
                                        <div className="flex-row" style={{ gap: 10 }}>
                                            <div style={{ fontSize: '2rem' }}>{event.emoji}</div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.3 }}>{event.title}</div>
                                                <span style={{ fontSize: '0.68rem', color: typeColors[event.type], fontWeight: 600 }}>{event.type}</span>
                                            </div>
                                        </div>
                                        {isReg && <span className="badge badge-teal">✓ Registered</span>}
                                    </div>

                                    <div style={{ display: 'flex', gap: 14, fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                                        <span><Calendar size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />{event.date}</span>
                                        <span><Clock size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />{event.time}</span>
                                        <span><MapPin size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />{event.venue}</span>
                                    </div>

                                    {/* Seat fill bar */}
                                    <div style={{ marginBottom: 12 }}>
                                        <div className="flex-between" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                                            <span>{event.filled}/{event.seats} registered</span>
                                            <span style={{ color: isFull ? 'var(--accent-pink)' : fillPct > 80 ? 'var(--accent-gold)' : 'var(--accent-teal)', fontWeight: 600 }}>
                                                {isFull ? 'Full!' : `${fillPct}% filled`}
                                            </span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{
                                                width: `${fillPct}%`,
                                                background: isFull ? 'linear-gradient(90deg, #ff5050, #ff8a65)' : fillPct > 80 ? 'linear-gradient(90deg, #f7c948, #ff8a65)' : 'linear-gradient(90deg, #00d4aa, #00b8d4)',
                                            }} />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => !isFull && toggleReg(event.id, event.title)}
                                        disabled={isFull && !isReg}
                                        className="btn btn-full btn-sm"
                                        style={{
                                            background: isReg ? 'rgba(255,107,157,0.15)' : isFull ? 'rgba(255,255,255,0.05)' : `${typeColors[event.type]}20`,
                                            color: isReg ? 'var(--accent-pink)' : isFull ? 'var(--text-secondary)' : typeColors[event.type],
                                            border: `1px solid ${isReg ? 'rgba(255,107,157,0.3)' : isFull ? 'rgba(255,255,255,0.08)' : typeColors[event.type] + '44'}`,
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {isReg ? '✕ Cancel Registration' : isFull ? 'Registration Full' : '+ Register Now'}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}

                {activeTab === 'Notices' && (
                    <div className="animate-fadeIn flex-col" style={{ gap: 10 }}>
                        {notices.map((n, i) => (
                            <div key={i} className="list-item" style={{ borderLeft: n.urgent ? '3px solid var(--accent-pink)' : '3px solid rgba(255,255,255,0.08)' }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: n.urgent ? 'rgba(255,107,157,0.15)' : 'rgba(255,255,255,0.05)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Bell size={18} color={n.urgent ? 'var(--accent-pink)' : 'var(--text-secondary)'} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="list-item-title">{n.title}</div>
                                    <div className="list-item-sub">{n.date}</div>
                                </div>
                                {n.urgent && <span className="badge badge-pink">New</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <BottomNav role="student" items={navItems} />
            <Chatbot accentColor="var(--accent-teal)" />
        </div>
    )
}
