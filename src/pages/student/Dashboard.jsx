import React, { useState, useEffect } from 'react'
import { LayoutDashboard, Camera, BookOpen, Star, Calendar, TrendingUp, Trophy, Activity, Flame } from 'lucide-react'
import BottomNav from '../../components/BottomNav'
import PageHeader from '../../components/PageHeader'
import Chatbot from '../../components/Chatbot'
import DashboardCard from '../../components/DashboardCard'
import ChartSection from '../../components/ChartSection'
import { getDashboard } from '../../api/student'
import { getUser } from '../../api/auth'
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
    ResponsiveContainer
} from 'recharts'

const navItems = [
    { label: 'Home', icon: LayoutDashboard, path: '/student' },
    { label: 'Attendance', icon: Camera, path: '/student/face-attendance' },
    { label: 'Results', icon: BookOpen, path: '/student/results' },
    { label: 'Feedback', icon: Star, path: '/student/feedback' },
    { label: 'More', icon: Calendar, path: '/student/events' },
]

const gradeColors = { 'A+': '#00d4aa', A: '#6c63ff', 'B+': '#4fc3f7', B: '#f7c948', C: '#ff8a65' }

export default function StudentDashboard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const user = getUser()

    useEffect(() => {
        getDashboard()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-teal)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                <div style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</div>
            </div>
        </div>
    )

    const { student, cgpa, attendance, results, achievements, assignments } = data || {}

    const cgpaTrend = [
        { sem: 'S1', cgpa: 7.8 }, { sem: 'S2', cgpa: 8.2 },
        { sem: 'S3', cgpa: 8.6 }, { sem: 'S4', cgpa: 9.1 },
        { sem: 'S5', cgpa: 8.8 }, { sem: 'S6', cgpa: cgpa || 9.2 },
    ]

    const radarData = [
        { cat: 'Attendance', val: Math.min((attendance?.pct || 87), 100) },
        { cat: 'CGPA', val: (cgpa || 9.2) * 10 },
        { cat: 'Assignments', val: assignments ? Math.round((assignments.submitted / assignments.total) * 100) : 90 },
        { cat: 'Projects', val: 88 },
        { cat: 'Rank', val: Math.max(100 - ((student?.rank || 4) - 1) * 5, 40) },
    ]

    return (
        <div className="page-wrapper">
            <PageHeader title="My Dashboard" subtitle={`${user?.name || student?.name} · CS-${student?.section || 'B'} · Sem ${student?.semester || 6}`} role="student" />
            <div className="page-content" style={{ paddingBottom: 100 }}>

                {/* Hero Stats */}
                <div className="grid-2 animate-fadeInUp" style={{ marginBottom: 20, gap: 14 }}>
                    <DashboardCard
                        title="CGPA"
                        value={cgpa || '—'}
                        icon={TrendingUp}
                        color="var(--accent-teal)"
                        subtitle="Current Semester"
                    />
                    <DashboardCard
                        title="Attendance"
                        value={`${attendance?.pct || 87}%`}
                        icon={Activity}
                        color="var(--accent-gold)"
                        trend="up"
                        trendValue="Good"
                    />
                    <DashboardCard
                        title="Class Rank"
                        value={`#${student?.rank || 4}`}
                        icon={Trophy}
                        color="var(--accent-purple)"
                        subtitle="Top 5%"
                    />
                    <DashboardCard
                        title="Day Streak"
                        value={student?.streak || 7}
                        icon={Flame}
                        color="var(--accent-pink)"
                        subtitle="Keep it up!"
                    />
                </div>

                {/* Radar Chart */}
                <div className="animate-fadeInUp delay-1" style={{ marginBottom: 20, height: 280 }}>
                    <ChartSection title="Skills Overview">
                        <RadarChart data={radarData} outerRadius={80}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis dataKey="cat" tick={{ fill: '#9090b0', fontSize: 11 }} />
                            <Radar dataKey="val" stroke="#00d4aa" fill="#00d4aa" fillOpacity={0.2} strokeWidth={2} dot={{ fill: '#00d4aa', r: 3 }} />
                        </RadarChart>
                    </ChartSection>
                </div>

                {/* CGPA Trend */}
                <div className="animate-fadeInUp delay-2" style={{ marginBottom: 20, height: 240 }}>
                    <ChartSection title="CGPA Progression">
                        <LineChart data={cgpaTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="sem" tick={{ fill: '#9090b0', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[6, 10]} tick={{ fill: '#9090b0', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f0f0ff', fontSize: 12 }} />
                            <Line type="monotone" dataKey="cgpa" stroke="#00d4aa" strokeWidth={3} dot={{ fill: '#00d4aa', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ChartSection>
                </div>

                {/* Subject grades from DB */}
                {results && results.length > 0 && (
                    <div className="animate-fadeInUp delay-3" style={{ marginBottom: 20 }}>
                        <div className="section-title">Current Semester Grades</div>
                        <div className="flex-col" style={{ gap: 10 }}>
                            {results.map((r, i) => (
                                <div key={i} className="glass-card" style={{ padding: '14px 16px' }}>
                                    <div className="flex-between" style={{ marginBottom: 8 }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{r.subject}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{r.subject_code}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: gradeColors[r.grade] || '#fff' }}>{r.grade}</div>
                                            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{r.total}/{r.max_marks}</div>
                                        </div>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${(r.total / r.max_marks) * 100}%`, background: `linear-gradient(90deg, ${gradeColors[r.grade] || '#6c63ff'}, ${gradeColors[r.grade] || '#6c63ff'}88)` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Achievements */}
                {achievements && achievements.length > 0 && (
                    <div className="animate-fadeInUp delay-4">
                        <div className="section-title">Achievements</div>
                        <div className="grid-2" style={{ gap: 14 }}>
                            {achievements.map((a, i) => (
                                <div key={i} className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>{a.icon}</div>
                                    <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{a.title}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 4 }}>{a.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <BottomNav role="student" items={navItems} />
            <Chatbot accentColor="var(--accent-teal)" />
        </div>
    )
}
