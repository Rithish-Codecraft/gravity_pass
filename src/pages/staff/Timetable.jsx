import React, { useState } from 'react'
import { LayoutDashboard, ClipboardCheck, BookOpen, Calendar, FileText, Plus, Edit3, Save } from 'lucide-react'
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

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const periods = [
    { time: '9–10', label: '09:00' },
    { time: '10–11', label: '10:00' },
    { time: '11–12', label: '11:00' },
    { time: '12–1', label: '12:00' },
    { time: '2–3', label: '14:00' },
    { time: '3–4', label: '15:00' },
]

const subjectColors = {
    'DS': 'rgba(108,99,255,0.2)',
    'ALGO': 'rgba(0,212,170,0.2)',
    'DBMS': 'rgba(247,201,72,0.2)',
    'NET': 'rgba(255,107,157,0.2)',
    'OS': 'rgba(79,195,247,0.2)',
    'FREE': 'rgba(255,255,255,0.04)',
    'LAB': 'rgba(255,138,101,0.2)',
}

const initialTT = [
    ['DS', 'DS', 'ALGO', 'DBMS', 'NET'],
    ['ALGO', 'DBMS', 'DS', 'NET', 'OS'],
    ['DBMS', 'FREE', 'OS', 'ALGO', 'DS'],
    ['NET', 'OS', 'FREE', 'LAB', 'DBMS'],
    ['OS', 'ALGO', 'DBMS', 'DS', 'FREE'],
    ['LAB', 'LAB', 'NET', 'OS', 'ALGO'],
]

export default function StaffTimetable() {
    const [timetable, setTimetable] = useState(initialTT)
    const [editing, setEditing] = useState(null) // {row, col}
    const [toast, setToast] = useState(null)
    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000) }

    const handleCellClick = (row, col) => {
        setEditing({ row, col })
    }
    const handleCellBlur = () => setEditing(null)
    const handleCellChange = (e, row, col) => {
        const val = e.target.value.toUpperCase().slice(0, 6)
        setTimetable(tt => tt.map((r, ri) => r.map((c, ci) => ri === row && ci === col ? val : c)))
    }

    const subjectSummary = {}
    timetable.flat().forEach(s => { if (s !== 'FREE') subjectSummary[s] = (subjectSummary[s] || 0) + 1 })

    return (
        <div className="page-wrapper">
            {toast && <div className="toast">{toast}</div>}
            <PageHeader title="Timetable" subtitle="Weekly Class Schedule" role="staff" back="/staff" />
            <div className="page-content" style={{ paddingBottom: 100 }}>

                <div className="animate-fadeInUp" style={{ marginBottom: 16 }}>
                    <div className="flex-between" style={{ marginBottom: 14 }}>
                        <div className="section-title" style={{ marginBottom: 0 }}>Weekly Grid</div>
                        <button className="btn btn-ghost btn-sm" onClick={() => showToast('✅ Timetable saved!')}>
                            <Save size={14} /> Save
                        </button>
                    </div>

                    {/* Tip */}
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                        💡 Tap any cell to edit subject code
                    </div>

                    {/* Grid - horizontal scroll */}
                    <div style={{ overflowX: 'auto' }}>
                        <div style={{ minWidth: 400 }}>
                            <div className="timetable-grid">
                                {/* Header row */}
                                <div className="tt-cell tt-header"></div>
                                {days.map(d => (
                                    <div key={d} className="tt-cell tt-header" style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>{d}</div>
                                ))}

                                {/* Data rows */}
                                {periods.map((period, ri) => (
                                    <React.Fragment key={ri}>
                                        <div className="tt-cell tt-header" style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                                            {period.label}
                                        </div>
                                        {days.map((_, ci) => {
                                            const sub = timetable[ri]?.[ci] || 'FREE'
                                            const isEditing = editing?.row === ri && editing?.col === ci
                                            return (
                                                <div
                                                    key={ci}
                                                    className="tt-cell"
                                                    style={{
                                                        background: subjectColors[sub] || 'rgba(255,255,255,0.04)',
                                                        cursor: 'pointer',
                                                        border: isEditing ? '1px solid var(--accent-purple)' : '1px solid var(--border-color)',
                                                    }}
                                                    onClick={() => handleCellClick(ri, ci)}
                                                >
                                                    {isEditing ? (
                                                        <input
                                                            autoFocus
                                                            defaultValue={sub}
                                                            onChange={e => handleCellChange(e, ri, ci)}
                                                            onBlur={handleCellBlur}
                                                            style={{
                                                                width: '100%', background: 'transparent',
                                                                border: 'none', outline: 'none',
                                                                color: 'var(--text-primary)', textAlign: 'center',
                                                                fontWeight: 700, fontSize: '0.7rem', fontFamily: 'var(--font-main)',
                                                            }}
                                                        />
                                                    ) : (
                                                        <span className="tt-subject" style={{ color: sub === 'FREE' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                                                            {sub}
                                                        </span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subject Summary */}
                <div className="animate-fadeInUp delay-2">
                    <div className="section-title">Subject Hours / Week</div>
                    <div className="grid-2" style={{ gap: 10 }}>
                        {Object.entries(subjectSummary).map(([sub, count]) => (
                            <div key={sub} className="glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{
                                    fontWeight: 700, fontSize: '0.85rem',
                                    color: sub === 'DS' ? '#6c63ff' : sub === 'ALGO' ? '#00d4aa' : sub === 'DBMS' ? '#f7c948' : 'var(--text-primary)',
                                }}>{sub}</div>
                                <span className="badge badge-purple">{count} hrs</span>
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
