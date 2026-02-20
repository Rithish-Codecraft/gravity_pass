import React, { useState } from 'react'
import { LayoutDashboard, ClipboardCheck, BookOpen, Calendar, FileText, Send, CheckCircle } from 'lucide-react'
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

const leaveTypes = ['Casual Leave', 'Medical Leave', 'Emergency Leave', 'On-Duty Leave', 'Maternity/Paternity Leave']
const leaveHistory = [
    { type: 'Casual Leave', from: 'Feb 10', to: 'Feb 11', days: 2, status: 'Approved', reason: 'Personal work' },
    { type: 'Medical Leave', from: 'Jan 5', to: 'Jan 6', days: 2, status: 'Approved', reason: 'Health checkup' },
    { type: 'On-Duty Leave', from: 'Dec 14', to: 'Dec 14', days: 1, status: 'Pending', reason: 'Workshop at IIT Madras' },
]

const statusColors = { Approved: 'var(--accent-teal)', Pending: 'var(--accent-gold)', Rejected: 'var(--accent-pink)' }
const statusBadge = { Approved: 'badge-teal', Pending: 'badge-gold', Rejected: 'badge-pink' }

export default function StaffLeave() {
    const [type, setType] = useState(leaveTypes[0])
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')
    const [reason, setReason] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [toast, setToast] = useState(null)

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

    const handleSubmit = () => {
        if (!from || !to || !reason) { showToast('⚠️ Fill all fields!'); return }
        setSubmitting(true)
        setTimeout(() => {
            setSubmitting(false); setSubmitted(true)
            showToast('✅ Leave request submitted!')
        }, 1400)
    }

    const balance = { Casual: 10, Medical: 12, 'On-Duty': 8 }

    return (
        <div className="page-wrapper">
            {toast && <div className="toast">{toast}</div>}
            <PageHeader title="Leave Request" subtitle="Apply & Track Leave" role="staff" back="/staff" />
            <div className="page-content" style={{ paddingBottom: 100 }}>

                {/* Balance */}
                <div className="grid-3 animate-fadeInUp" style={{ marginBottom: 24 }}>
                    {Object.entries(balance).map(([k, v]) => (
                        <div key={k} className="stat-card" style={{ textAlign: 'center', gap: 4 }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-teal)' }}>{v}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{k} Left</div>
                        </div>
                    ))}
                </div>

                {/* Apply form */}
                {!submitted ? (
                    <div className="glass-card animate-fadeInUp delay-1" style={{ padding: 18, marginBottom: 24 }}>
                        <div className="section-title">Apply for Leave</div>
                        <select className="input-field" value={type} onChange={e => setType(e.target.value)} style={{ marginBottom: 10 }}>
                            {leaveTypes.map(l => <option key={l}>{l}</option>)}
                        </select>
                        <div className="grid-2" style={{ marginBottom: 10 }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 5 }}>From</div>
                                <input type="date" className="input-field" value={from} onChange={e => setFrom(e.target.value)} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 5 }}>To</div>
                                <input type="date" className="input-field" value={to} onChange={e => setTo(e.target.value)} />
                            </div>
                        </div>
                        <textarea
                            className="input-field"
                            placeholder="Reason for leave..."
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            rows={3}
                            style={{ resize: 'none', marginBottom: 14 }}
                        />
                        <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={submitting}>
                            {submitting
                                ? <><div style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Submitting...</>
                                : <><Send size={16} /> Submit Request</>
                            }
                        </button>
                    </div>
                ) : (
                    <div className="glass-card animate-scaleIn" style={{ padding: 24, textAlign: 'center', marginBottom: 24, border: '1px solid var(--accent-teal)4d' }}>
                        <CheckCircle size={48} color="var(--accent-teal)" style={{ margin: '0 auto 12px' }} />
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 6 }}>Request Submitted!</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Your leave request has been sent for approval.</div>
                        <button className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={() => setSubmitted(false)}>Apply Another</button>
                    </div>
                )}

                {/* History */}
                <div className="animate-fadeInUp delay-3">
                    <div className="section-title">Leave History</div>
                    <div className="flex-col" style={{ gap: 10 }}>
                        {leaveHistory.map((l, i) => (
                            <div key={i} className="glass-card" style={{ padding: 16, borderLeft: `3px solid ${statusColors[l.status]}` }}>
                                <div className="flex-between" style={{ marginBottom: 6 }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{l.type}</span>
                                    <span className={`badge ${statusBadge[l.status]}`}>{l.status}</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{l.reason}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                    {l.from} → {l.to} · <strong style={{ color: 'var(--text-primary)' }}>{l.days} day{l.days > 1 ? 's' : ''}</strong>
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
