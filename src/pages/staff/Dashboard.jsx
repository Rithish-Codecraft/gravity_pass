import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Camera, FileText, Calendar, Bell, Users, BookOpen, Clock, Activity } from 'lucide-react'
import BottomNav from '../../components/BottomNav'
import PageHeader from '../../components/PageHeader'
import Chatbot from '../../components/Chatbot'
import DashboardCard from '../../components/DashboardCard'
import ChartSection from '../../components/ChartSection'
import QuickActions from '../../components/QuickActions'
import { getDashboard } from '../../api/staff'
import { getUser } from '../../api/auth'
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'

const navItems = [
    { label: 'Home', icon: LayoutDashboard, path: '/staff' },
    { label: 'Attendance', icon: Camera, path: '/staff/attendance' },
    { label: 'Notes', icon: FileText, path: '/staff/notes' },
    { label: 'Timetable', icon: Calendar, path: '/staff/timetable' },
    { label: 'More', icon: Bell, path: '/staff/announcements' },
]

const attendanceTrend = [
    { day: 'Mon', pct: 88 }, { day: 'Tue', pct: 92 },
    { day: 'Wed', pct: 85 }, { day: 'Thu', pct: 91 },
    { day: 'Fri', pct: 78 }, { day: 'Sat', pct: 95 },
]

const subjectColors = { DS: '#6c63ff', Algo: '#00d4aa', OS: '#f7c948', DBMS: '#ff6b9d', NET: '#4fc3f7' }

export default function StaffDashboard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const user = getUser()
    const navigate = useNavigate()

    useEffect(() => {
        getDashboard()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-purple)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                <div style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</div>
            </div>
        </div>
    )

    const { staff, stats, todaySchedule } = data || {}
    const subjectsList = staff?.subjectsList || []

    return (
        <div className="page-wrapper">
            <PageHeader title="Staff Portal" subtitle={`Welcome back, ${user?.name || staff?.name || 'Professor'} 👋`} role="staff" />
            <div className="page-content" style={{ paddingBottom: 100 }}>

                {/* KPI stats */}
                <div className="grid-2 animate-fadeInUp" style={{ marginBottom: 20, gap: 14 }}>
                    <DashboardCard
                        title="Students"
                        value={stats?.studentsCount || 180}
                        icon={Users}
                        color="var(--accent-teal)"
                    />
                    <DashboardCard
                        title="Notes"
                        value={stats?.notesCount || 0}
                        icon={BookOpen}
                        color="var(--accent-purple)"
                        subtitle="Uploaded"
                    />
                    <DashboardCard
                        title="Att. Marked"
                        value={stats?.todayAttendanceMarked || 0}
                        icon={Camera}
                        color="var(--accent-gold)"
                        subtitle="Today"
                    />
                    <DashboardCard
                        title="Subjects"
                        value={subjectsList.length || 4}
                        icon={Calendar}
                        color="var(--accent-pink)"
                        subtitle="Total"
                    />
                </div>

                {/* Quick actions */}
                <div className="animate-fadeInUp delay-1" style={{ marginBottom: 20 }}>
                    <div className="section-title">Quick Actions</div>
                    <QuickActions actions={[
                        { label: 'Mark Attendance', path: '/staff/attendance', icon: Camera, color: 'var(--accent-teal)', desc: 'Take class attendance' },
                        { label: 'Upload Notes', path: '/staff/notes', icon: FileText, color: 'var(--accent-purple)', desc: 'Share study materials' },
                        { label: 'Announcements', path: '/staff/announcements', icon: Bell, color: 'var(--accent-gold)', desc: 'Post updates' },
                        { label: 'Leave Request', path: '/staff/leave', icon: Calendar, color: 'var(--accent-pink)', desc: 'Apply for leave' },
                    ]} />
                </div>

                {/* Attendance chart */}
                <div className="animate-fadeInUp delay-2" style={{ marginBottom: 20, height: 260 }}>
                    <ChartSection title="Weekly Attendance">
                        <AreaChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="day" tick={{ fill: '#9090b0', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[60, 100]} tick={{ fill: '#9090b0', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f0f0ff', fontSize: 12 }} />
                            <Area type="monotone" dataKey="pct" stroke="#6c63ff" strokeWidth={3} fill="url(#attGrad)" dot={{ fill: '#6c63ff', strokeWidth: 2, r: 4 }} />
                        </AreaChart>
                    </ChartSection>
                </div>

                {/* Today's schedule from DB */}
                <div className="animate-fadeInUp delay-3">
                    <div className="section-title">Today's Schedule</div>
                    {todaySchedule && todaySchedule.length > 0 ? (
                        <div className="flex-col" style={{ gap: 10 }}>
                            {todaySchedule.map((item, i) => (
                                <div key={i} className="glass-card list-item" style={{ borderLeft: `3px solid ${subjectColors[item.subject] || 'var(--accent-purple)'}` }}>
                                    <div style={{
                                        width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: `${subjectColors[item.subject] || 'var(--accent-purple)'}20`,
                                        fontWeight: 800, fontSize: '0.75rem', color: subjectColors[item.subject] || 'var(--accent-purple)',
                                    }}>{item.subject}</div>
                                    <div style={{ flex: 1 }}>
                                        <div className="list-item-title">{item.subject}</div>
                                        <div className="list-item-sub">Period {item.period} · {item.time || '10:00 AM'}</div>
                                    </div>
                                    <div style={{
                                        padding: '6px 12px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 600,
                                        background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6
                                    }}>
                                        <Clock size={14} /> Upcoming
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card" style={{ padding: 30, textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: 10 }}>☕</div>
                            <div>No classes scheduled today</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Enjoy your free time!</div>
                        </div>
                    )}
                </div>
            </div>
            <BottomNav role="staff" items={navItems} />
            <Chatbot accentColor="var(--accent-purple)" />
        </div>
    )
}
