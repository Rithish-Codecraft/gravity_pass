import React, { useState } from 'react'
import { LayoutDashboard, ClipboardCheck, BookOpen, Calendar, FileText, Megaphone, Plus, Send, Bell, Users, Globe } from 'lucide-react'
import BottomNav from '../../components/BottomNav'
import PageHeader from '../../components/PageHeader'
import Chatbot from '../../components/Chatbot'

const navItems = [
    { label: 'Home', icon: LayoutDashboard, path: '/staff' },
    { label: 'Attendance', icon: ClipboardCheck, path: '/staff/attendance' },
    { label: 'Notes', icon: BookOpen, path: '/staff/notes' },
    { label: 'Timetable', icon: Calendar, path: '/staff/timetable' },
    { label: 'More', icon: FileText, path: '/staff/announcements' },
]

const existingAnn = [
    { id: 1, title: 'Internal Exam Schedule', body: 'Internal exams for all subjects are scheduled from March 10–15. Attendance is mandatory.', target: 'All Students', time: '2 days ago', urgent: true },
    { id: 2, title: 'Assignment Submission Extended', body: 'Deadline for CS302 assignment extended to March 5. Submit via EduSphere portal.', target: 'CS302 Students', time: '4 days ago', urgent: false },
    { id: 3, title: 'Lab Maintenance', body: 'Lab 2 will be under maintenance on Feb 25. Classes will be held in Hall A.', target: 'All Students', time: '1 week ago', urgent: false },
]

export default function StaffAnnouncements() {
    const [announcements, setAnnouncements] = useState(existingAnn)
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [target, setTarget] = useState('All Students')
    const [urgent, setUrgent] = useState(false)
    const [sending, setSending] = useState(false)
    const [toast, setToast] = useState(null)

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

    const handlePublish = () => {
        if (!title || !body) { showToast('⚠️ Fill in title and message!'); return }
        setSending(true)
        setTimeout(() => {
            setSending(false)
            setAnnouncements(prev => [{
                id: Date.now(), title, body, target, time: 'Just now', urgent,
            }, ...prev])
            setTitle(''); setBody(''); setUrgent(false)
            showToast('📢 Announcement published!')
        }, 1200)
    }

    return (
        <div className="page-wrapper">
            {toast && <div className="toast">{toast}</div>}
            <PageHeader title="Announcements" subtitle="Publish & Manage Circulars" role="staff" back="/staff" />
            <div className="page-content" style={{ paddingBottom: 100 }}>

                {/* Compose */}
                <div className="animate-fadeInUp" style={{ marginBottom: 24 }}>
                    <div className="section-title">New Announcement</div>
                    <div className="glass-card" style={{ padding: 18 }}>
                        <input className="input-field" placeholder="Title..." value={title} onChange={e => setTitle(e.target.value)} style={{ marginBottom: 10 }} />
                        <textarea
                            className="input-field"
                            placeholder="Write your message..."
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            rows={4}
                            style={{ resize: 'none', lineHeight: 1.6, marginBottom: 10 }}
                        />
                        <select className="input-field" value={target} onChange={e => setTarget(e.target.value)} style={{ marginBottom: 14 }}>
                            <option>All Students</option>
                            <option>CS301 Students</option>
                            <option>CS302 Students</option>
                            <option>Final Year Students</option>
                            <option>All Staff</option>
                        </select>
                        <div className="flex-between" style={{ marginBottom: 14 }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mark as Urgent</span>
                            <label className="toggle">
                                <input type="checkbox" checked={urgent} onChange={e => setUrgent(e.target.checked)} />
                                <span className="toggle-slider" />
                            </label>
                        </div>
                        <button className="btn btn-primary btn-full" onClick={handlePublish} disabled={sending}>
                            {sending
                                ? <><div style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Publishing...</>
                                : <><Send size={16} /> Publish Announcement</>
                            }
                        </button>
                    </div>
                </div>

                {/* Previous */}
                <div className="animate-fadeInUp delay-2">
                    <div className="flex-between" style={{ marginBottom: 14 }}>
                        <div className="section-title" style={{ marginBottom: 0 }}>Published</div>
                        <span className="badge badge-purple">{announcements.length} total</span>
                    </div>
                    <div className="flex-col" style={{ gap: 12 }}>
                        {announcements.map(ann => (
                            <div key={ann.id} className="glass-card" style={{ padding: 16, borderLeft: ann.urgent ? '3px solid var(--accent-pink)' : '3px solid var(--border-color)' }}>
                                <div className="flex-between" style={{ marginBottom: 8 }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{ann.title}</span>
                                    {ann.urgent && <span className="badge badge-pink">🔴 Urgent</span>}
                                </div>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>{ann.body}</p>
                                <div className="flex-between" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                    <span><Users size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />{ann.target}</span>
                                    <span>{ann.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <BottomNav role="staff" items={navItems} />
            <Chatbot accentColor="var(--accent-purple)" />
        </div>
    )
}
