import React, { useState } from 'react'
import { LayoutDashboard, Camera, BookOpen, Star, Calendar, Download, Trophy, TrendingDown, TrendingUp } from 'lucide-react'
import BottomNav from '../../components/BottomNav'
import PageHeader from '../../components/PageHeader'
import Chatbot from '../../components/Chatbot'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from 'recharts'

const navItems = [
    { label: 'Home', icon: LayoutDashboard, path: '/student' },
    { label: 'Attendance', icon: Camera, path: '/student/face-attendance' },
    { label: 'Results', icon: BookOpen, path: '/student/results' },
    { label: 'Feedback', icon: Star, path: '/student/feedback' },
    { label: 'More', icon: Calendar, path: '/student/events' },
]

const subjects = [
    { code: 'CS301', name: 'Data Structures', internal: 48, external: 85, total: 133, max: 150, grade: 'A', gpa: 9 },
    { code: 'CS302', name: 'Algorithms', internal: 50, external: 92, total: 142, max: 150, grade: 'A+', gpa: 10 },
    { code: 'CS303', name: 'DBMS', internal: 44, external: 78, total: 122, max: 150, grade: 'B+', gpa: 8 },
    { code: 'CS304', name: 'Networks', internal: 46, external: 84, total: 130, max: 150, grade: 'A', gpa: 9 },
    { code: 'CS305', name: 'OS', internal: 40, external: 73, total: 113, max: 150, grade: 'B', gpa: 7 },
]

const gradeColors = { 'A+': '#00d4aa', A: '#6c63ff', 'B+': '#4fc3f7', B: '#f7c948', C: '#ff8a65' }
const semesterHistory = [
    { sem: 'S1', sgpa: 7.8, rank: 8 },
    { sem: 'S2', sgpa: 8.2, rank: 7 },
    { sem: 'S3', sgpa: 8.6, rank: 5 },
    { sem: 'S4', sgpa: 9.1, rank: 3 },
    { sem: 'S5', sgpa: 8.8, rank: 4 },
    { sem: 'S6', sgpa: 9.2, rank: 4 },
]

export default function StudentResults() {
    const [activeSem, setActiveSem] = useState('S6')
    const [toast, setToast] = useState(null)
    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000) }

    const cgpa = (semesterHistory.reduce((a, s) => a + s.sgpa, 0) / semesterHistory.length).toFixed(2)
    const currentSem = semesterHistory.find(s => s.sem === activeSem)

    return (
        <div className="page-wrapper">
            {toast && <div className="toast">{toast}</div>}
            <PageHeader title="Results" subtitle="Academic Performance" role="student" back="/student" />
            <div className="page-content" style={{ paddingBottom: 100 }}>

                {/* CGPA card */}
                <div className="animate-fadeInUp glass-card" style={{
                    padding: 20, marginBottom: 20,
                    background: 'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(108,99,255,0.08))',
                    borderColor: 'rgba(0,212,170,0.3)',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Cumulative GPA
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 900, color: 'var(--accent-teal)', lineHeight: 1 }}>
                        {cgpa}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>out of 10.0 · B.Tech CSE Sem 6</div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
                        <button className="btn btn-teal btn-sm" onClick={() => showToast('📄 Marksheet downloaded!')}>
                            <Download size={14} /> Marksheet
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => showToast('📊 Share link copied!')}>
                            Share Results
                        </button>
                    </div>
                </div>

                {/* Semester selector */}
                <div className="tab-bar animate-fadeInUp delay-1" style={{ marginBottom: 20 }}>
                    {semesterHistory.map(s => (
                        <button key={s.sem} className={`tab-pill ${activeSem === s.sem ? 'active' : ''}`} onClick={() => setActiveSem(s.sem)}>
                            {s.sem}
                        </button>
                    ))}
                </div>

                {/* SGPA bar chart */}
                <div className="chart-container animate-fadeInUp delay-2" style={{ marginBottom: 20 }}>
                    <div className="chart-title">SGPA by Semester</div>
                    <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={semesterHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="sem" tick={{ fill: '#9090b0', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[6, 10]} tick={{ fill: '#9090b0', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f0f0ff', fontSize: 12 }} />
                            <Bar dataKey="sgpa" radius={[6, 6, 0, 0]}>
                                {semesterHistory.map((entry, i) => (
                                    <Cell key={i} fill={entry.sem === activeSem ? '#00d4aa' : 'rgba(108,99,255,0.4)'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Subject table for current sem */}
                <div className="animate-fadeInUp delay-3">
                    <div className="flex-between" style={{ marginBottom: 14 }}>
                        <div className="section-title" style={{ marginBottom: 0 }}>Semester {activeSem} Subjects</div>
                        {currentSem && (
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 800, color: 'var(--accent-teal)', fontSize: '1.1rem' }}>{currentSem.sgpa}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>SGPA · Rank #{currentSem.rank}</div>
                            </div>
                        )}
                    </div>

                    {/* Table header */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px 50px',
                        gap: 8, padding: '8px 12px',
                        fontSize: '0.68rem', color: 'var(--text-secondary)',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                        <span>Subject</span><span style={{ textAlign: 'center' }}>Int</span>
                        <span style={{ textAlign: 'center' }}>Ext</span>
                        <span style={{ textAlign: 'center' }}>Total</span>
                        <span style={{ textAlign: 'center' }}>Grade</span>
                    </div>

                    <div className="flex-col" style={{ gap: 8 }}>
                        {subjects.map((s, i) => (
                            <div key={i} className="glass-card" style={{ padding: '14px 12px', display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px 50px', gap: 8, alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.name}</div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{s.code}</div>
                                </div>
                                <div style={{ textAlign: 'center', fontWeight: 600, fontSize: '0.85rem' }}>{s.internal}</div>
                                <div style={{ textAlign: 'center', fontWeight: 600, fontSize: '0.85rem' }}>{s.external}</div>
                                <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.88rem', color: 'var(--accent-teal)' }}>{s.total}</div>
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{
                                        fontWeight: 800, fontSize: '0.85rem',
                                        color: gradeColors[s.grade] || 'var(--text-primary)',
                                    }}>{s.grade}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary row */}
                    <div className="glass-card" style={{
                        marginTop: 10, padding: '14px 12px',
                        display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px 50px',
                        gap: 8, alignItems: 'center',
                        background: 'rgba(0,212,170,0.06)', borderColor: 'rgba(0,212,170,0.2)',
                    }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-teal)' }}>Total</div>
                        <div style={{ textAlign: 'center', fontWeight: 700 }}>{subjects.reduce((a, s) => a + s.internal, 0)}</div>
                        <div style={{ textAlign: 'center', fontWeight: 700 }}>{subjects.reduce((a, s) => a + s.external, 0)}</div>
                        <div style={{ textAlign: 'center', fontWeight: 800, color: 'var(--accent-teal)', fontSize: '0.95rem' }}>
                            {subjects.reduce((a, s) => a + s.total, 0)}
                        </div>
                        <div style={{ textAlign: 'center', fontWeight: 800, color: 'var(--accent-teal)' }}>
                            {(subjects.reduce((a, s) => a + s.gpa, 0) / subjects.length).toFixed(1)}
                        </div>
                    </div>
                </div>
            </div>
            <BottomNav role="student" items={navItems} />
            <Chatbot accentColor="var(--accent-teal)" />
        </div>
    )
}
