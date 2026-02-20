import React, { useState } from 'react'
import { LayoutDashboard, ClipboardCheck, BookOpen, Calendar, FileText, CheckCircle, XCircle, Clock, Download, RotateCcw } from 'lucide-react'
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

const classes = ['CS301 - Data Structures', 'CS302 - Algorithms', 'CS303 - DBMS', 'CS304 - Networks']

const initialStudents = [
    { id: 'CS21001', name: 'Arjun Sharma', roll: '001', status: null },
    { id: 'CS21002', name: 'Priya Nair', roll: '002', status: null },
    { id: 'CS21003', name: 'Rahul Verma', roll: '003', status: null },
    { id: 'CS21004', name: 'Sneha Patel', roll: '004', status: null },
    { id: 'CS21005', name: 'Karthik Rajan', roll: '005', status: null },
    { id: 'CS21006', name: 'Divya Menon', roll: '006', status: null },
    { id: 'CS21007', name: 'Arun Kumar', roll: '007', status: null },
    { id: 'CS21008', name: 'Meera Iyer', roll: '008', status: null },
    { id: 'CS21009', name: 'Vikram Singh', roll: '009', status: null },
    { id: 'CS21010', name: 'Anjali Roy', roll: '010', status: null },
    { id: 'CS21011', name: 'Sanjay Gupta', roll: '011', status: null },
    { id: 'CS21012', name: 'Lekha Suresh', roll: '012', status: null },
]

export default function StaffAttendance() {
    const [selectedClass, setSelectedClass] = useState(classes[0])
    const [students, setStudents] = useState(initialStudents.map(s => ({ ...s })))
    const [submitted, setSubmitted] = useState(false)
    const [toast, setToast] = useState(null)

    const markAll = (status) => setStudents(s => s.map(st => ({ ...st, status })))
    const toggleStatus = (id) => {
        setStudents(s => s.map(st =>
            st.id === id
                ? { ...st, status: st.status === 'present' ? 'absent' : st.status === 'absent' ? 'late' : 'present' }
                : st
        ))
    }
    const reset = () => { setStudents(initialStudents.map(s => ({ ...s }))); setSubmitted(false) }

    const presentCount = students.filter(s => s.status === 'present').length
    const absentCount = students.filter(s => s.status === 'absent').length
    const lateCount = students.filter(s => s.status === 'late').length

    const showToast = (msg) => {
        setToast(msg)
        setTimeout(() => setToast(null), 2500)
    }

    const handleSubmit = () => {
        if (students.some(s => !s.status)) {
            showToast('⚠️ Mark all students before submitting!')
            return
        }
        setSubmitted(true)
        showToast('✅ Attendance submitted successfully!')
    }

    const statusColor = { present: 'var(--accent-teal)', absent: 'var(--accent-pink)', late: 'var(--accent-gold)' }
    const statusLabel = { present: 'P', absent: 'A', late: 'L' }

    return (
        <div className="page-wrapper">
            {toast && <div className="toast">{toast}</div>}
            <PageHeader title="Attendance" subtitle="Mark & Generate Reports" role="staff" back="/staff" />
            <div className="page-content" style={{ paddingBottom: 100 }}>

                {/* Class selector */}
                <div className="animate-fadeInUp" style={{ marginBottom: 20 }}>
                    <div className="section-title">Select Class</div>
                    <select
                        className="input-field"
                        value={selectedClass}
                        onChange={e => { setSelectedClass(e.target.value); reset() }}
                    >
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Date */}
                <div className="animate-fadeInUp delay-1" style={{ marginBottom: 20 }}>
                    <input
                        type="date"
                        className="input-field"
                        defaultValue={new Date().toISOString().split('T')[0]}
                    />
                </div>

                {/* Summary */}
                <div className="grid-3 animate-fadeInUp delay-1" style={{ marginBottom: 20 }}>
                    {[
                        { label: 'Present', count: presentCount, color: 'var(--accent-teal)' },
                        { label: 'Absent', count: absentCount, color: 'var(--accent-pink)' },
                        { label: 'Late', count: lateCount, color: 'var(--accent-gold)' },
                    ].map(s => (
                        <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}`, textAlign: 'center', gap: 4 }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.count}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Bulk mark */}
                <div className="animate-fadeInUp delay-2" style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                    <button className="btn btn-teal btn-sm" style={{ flex: 1 }} onClick={() => markAll('present')}>
                        <CheckCircle size={14} /> All Present
                    </button>
                    <button className="btn btn-sm" style={{ flex: 1, background: 'rgba(255,107,157,0.15)', color: 'var(--accent-pink)', border: '1px solid rgba(255,107,157,0.3)' }} onClick={() => markAll('absent')}>
                        <XCircle size={14} /> All Absent
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={reset}>
                        <RotateCcw size={14} />
                    </button>
                </div>

                {/* Tap legend */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    <span>Tap to cycle:</span>
                    <span style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>● P = Present</span>
                    <span style={{ color: 'var(--accent-pink)', fontWeight: 600 }}>● A = Absent</span>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>● L = Late</span>
                </div>

                {/* Student list */}
                <div className="animate-fadeInUp delay-3" style={{ marginBottom: 20 }}>
                    <div className="flex-col" style={{ gap: 8 }}>
                        {students.map((s, i) => (
                            <div
                                key={s.id}
                                className="list-item"
                                onClick={() => !submitted && toggleStatus(s.id)}
                                style={{
                                    borderColor: s.status ? statusColor[s.status] + '55' : 'var(--border-color)',
                                    background: s.status ? statusColor[s.status] + '0d' : 'var(--bg-card)',
                                    cursor: submitted ? 'default' : 'pointer',
                                }}
                            >
                                <div className="avatar" style={{
                                    background: s.status ? statusColor[s.status] + '25' : 'rgba(255,255,255,0.06)',
                                    color: s.status ? statusColor[s.status] : 'var(--text-secondary)',
                                    fontWeight: 800,
                                }}>
                                    {s.status ? statusLabel[s.status] : s.roll}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="list-item-title">{s.name}</div>
                                    <div className="list-item-sub">{s.id}</div>
                                </div>
                                <div style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    background: s.status ? statusColor[s.status] + '20' : 'rgba(255,255,255,0.06)',
                                    border: `2px solid ${s.status ? statusColor[s.status] : 'rgba(255,255,255,0.1)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s',
                                }}>
                                    {s.status === 'present' && <CheckCircle size={14} color="var(--accent-teal)" />}
                                    {s.status === 'absent' && <XCircle size={14} color="var(--accent-pink)" />}
                                    {s.status === 'late' && <Clock size={14} color="var(--accent-gold)" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                {!submitted ? (
                    <button className="btn btn-primary btn-full btn-lg animate-fadeInUp delay-4" onClick={handleSubmit}>
                        <CheckCircle size={18} /> Submit Attendance
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-ghost btn-full" onClick={reset} style={{ flex: 1 }}>
                            <RotateCcw size={16} /> Reset
                        </button>
                        <button className="btn btn-teal btn-full" style={{ flex: 1 }} onClick={() => showToast('📄 PDF generated!')}>
                            <Download size={16} /> Download PDF
                        </button>
                    </div>
                )}
            </div>
            <BottomNav role="staff" items={navItems} />
            <Chatbot accentColor="var(--accent-purple)" />
        </div>
    )
}
