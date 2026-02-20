import React, { useState } from 'react'
import { LayoutDashboard, GraduationCap, Users, UserCog, FileBarChart, Star, BookOpen, Clock, TrendingUp, Award, Search } from 'lucide-react'
import BottomNav from '../../components/BottomNav'
import PageHeader from '../../components/PageHeader'
import Chatbot from '../../components/Chatbot'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'

const navItems = [
    { label: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { label: 'Students', icon: GraduationCap, path: '/admin/student-performance' },
    { label: 'Staff', icon: Users, path: '/admin/staff-performance' },
    { label: 'Users', icon: UserCog, path: '/admin/users' },
    { label: 'Reports', icon: FileBarChart, path: '/admin/reports' },
]

const staffList = [
    { name: 'Dr. Priya Menon', id: 'STF001', dept: 'CSE', subjects: 4, avgFeedback: 4.7, attendance: 98, classComp: 96, leave: 2, status: 'Top Performer' },
    { name: 'Prof. Rajan Kumar', id: 'STF002', dept: 'CSE', subjects: 3, avgFeedback: 4.3, attendance: 94, classComp: 90, leave: 4, status: 'Good' },
    { name: 'Dr. Ananya Pillai', id: 'STF003', dept: 'ECE', subjects: 4, avgFeedback: 4.6, attendance: 97, classComp: 94, leave: 1, status: 'Top Performer' },
    { name: 'Prof. Vikram Nair', id: 'STF004', dept: 'MECH', subjects: 5, avgFeedback: 3.8, attendance: 88, classComp: 82, leave: 6, status: 'Needs Attention' },
    { name: 'Dr. Lakshmi Roy', id: 'STF005', dept: 'CSE', subjects: 3, avgFeedback: 4.4, attendance: 95, classComp: 91, leave: 3, status: 'Good' },
]

const feedbackData = [
    { name: 'Dr. Priya', score: 4.7 },
    { name: 'Dr. Ananya', score: 4.6 },
    { name: 'Dr. Lakshmi', score: 4.4 },
    { name: 'Prof. Rajan', score: 4.3 },
    { name: 'Prof. Vikram', score: 3.8 },
]

const performanceRadar = [
    { cat: 'Feedback', value: 88 },
    { cat: 'Attendance', value: 94 },
    { cat: 'Class Comp.', value: 91 },
    { cat: 'Notes Upload', value: 76 },
    { cat: 'Punctuality', value: 85 },
    { cat: 'Engagement', value: 80 },
]

const statusColors = { 'Top Performer': 'var(--accent-teal)', Good: 'var(--accent-purple)', 'Needs Attention': 'var(--accent-pink)' }
const statusBadge = { 'Top Performer': 'badge-teal', Good: 'badge-purple', 'Needs Attention': 'badge-pink' }

export default function AdminStaffPerformance() {
    const [search, setSearch] = useState('')

    const filtered = staffList.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) || s.dept.includes(search.toUpperCase())
    )

    return (
        <div className="page-wrapper">
            <PageHeader title="Staff Performance" subtitle="All Categories · Analytics" role="admin" back="/admin" />
            <div className="page-content" style={{ paddingBottom: 100 }}>

                {/* KPI */}
                <div className="grid-2 animate-fadeInUp" style={{ marginBottom: 20 }}>
                    {[
                        { label: 'Total Staff', value: '86', color: 'var(--accent-purple)' },
                        { label: 'Avg Feedback', value: '4.4⭐', color: 'var(--accent-gold)' },
                        { label: 'Avg Attendance', value: '94%', color: 'var(--accent-teal)' },
                        { label: 'Needs Attention', value: '8', color: 'var(--accent-pink)' },
                    ].map(k => (
                        <div key={k.label} className="stat-card" style={{ borderLeft: `3px solid ${k.color}`, gap: 4 }}>
                            <span className="stat-label">{k.label}</span>
                            <div className="stat-number" style={{ color: k.color }}>{k.value}</div>
                        </div>
                    ))}
                </div>

                {/* Radar */}
                <div className="chart-container animate-fadeInUp delay-1" style={{ marginBottom: 20 }}>
                    <div className="chart-title">Staff Performance Dimensions</div>
                    <ResponsiveContainer width="100%" height={210}>
                        <RadarChart data={performanceRadar}>
                            <PolarGrid stroke="rgba(255,255,255,0.08)" />
                            <PolarAngleAxis dataKey="cat" tick={{ fill: '#9090b0', fontSize: 11 }} />
                            <Radar dataKey="value" stroke="#6c63ff" fill="#6c63ff" fillOpacity={0.15} strokeWidth={2} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Feedback bar chart */}
                <div className="chart-container animate-fadeInUp delay-2" style={{ marginBottom: 20 }}>
                    <div className="chart-title">Student Feedback Scores</div>
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={feedbackData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" tick={{ fill: '#9090b0', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[3, 5]} tick={{ fill: '#9090b0', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f0f0ff', fontSize: 12 }} />
                            <Bar dataKey="score" fill="#6c63ff" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Staff list */}
                <div className="animate-fadeInUp delay-3">
                    <div className="section-title">Staff Directory & Performance</div>
                    <div style={{ position: 'relative', marginBottom: 14 }}>
                        <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input className="input-field" placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
                    </div>
                    <div className="flex-col" style={{ gap: 12 }}>
                        {filtered.map((s, i) => (
                            <div key={s.id} className="glass-card" style={{ padding: 16 }}>
                                <div className="flex-between" style={{ marginBottom: 10 }}>
                                    <div className="flex-row" style={{ gap: 12 }}>
                                        <div className="avatar" style={{
                                            background: `linear-gradient(135deg, var(--accent-purple), #9c6cff)`,
                                            color: '#fff', width: 44, height: 44, borderRadius: 12,
                                        }}>
                                            {s.name.split(' ').pop()[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.name}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{s.id} · {s.dept} · {s.subjects} subjects</div>
                                        </div>
                                    </div>
                                    <span className={`badge ${statusBadge[s.status]}`} style={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{s.status}</span>
                                </div>
                                <div className="grid-3" style={{ gap: 8, fontSize: '0.75rem' }}>
                                    <div className="glass-card" style={{ padding: '8px 10px', gap: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>{s.avgFeedback} ⭐</span>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>Feedback</span>
                                    </div>
                                    <div className="glass-card" style={{ padding: '8px 10px', gap: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--accent-teal)', fontWeight: 800 }}>{s.attendance}%</span>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>Attendance</span>
                                    </div>
                                    <div className="glass-card" style={{ padding: '8px 10px', gap: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--accent-purple)', fontWeight: 800 }}>{s.classComp}%</span>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>Class Comp.</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <BottomNav role="admin" items={navItems} />
            <Chatbot accentColor="var(--accent-gold)" />
        </div>
    )
}
