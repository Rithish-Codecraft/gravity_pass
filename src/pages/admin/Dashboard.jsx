import React, { useState, useEffect } from 'react'
import {
    LayoutDashboard, Users, UserCog, FileBarChart,
    GraduationCap, Award, Activity, TrendingUp, TrendingDown
} from 'lucide-react'
import BottomNav from '../../components/BottomNav'
import PageHeader from '../../components/PageHeader'
import Chatbot from '../../components/Chatbot'
import DashboardCard from '../../components/DashboardCard'
import ChartSection from '../../components/ChartSection'
import QuickActions from '../../components/QuickActions'
import {
    PieChart, Pie, Cell, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    AreaChart, Area, ResponsiveContainer
} from 'recharts'

const navItems = [
    { label: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { label: 'Students', icon: GraduationCap, path: '/admin/student-performance' },
    { label: 'Staff', icon: Users, path: '/admin/staff-performance' },
    { label: 'Users', icon: UserCog, path: '/admin/users' },
    { label: 'Reports', icon: FileBarChart, path: '/admin/reports' },
]

const enrollmentData = [
    { dept: 'CSE', count: 320 },
    { dept: 'ECE', count: 280 },
    { dept: 'MECH', count: 240 },
    { dept: 'CIVIL', count: 200 },
    { dept: 'IT', count: 180 },
]

const gradeDistribution = [
    { name: 'A+ / A', value: 38, color: '#00d4aa' },
    { name: 'B+ / B', value: 35, color: '#6c63ff' },
    { name: 'C+ / C', value: 18, color: '#f7c948' },
    { name: 'D / F', value: 9, color: '#ff6b9d' },
]

const weeklyAttendance = [
    { week: 'W1', rate: 85 },
    { week: 'W2', rate: 88 },
    { week: 'W3', rate: 82 },
    { week: 'W4', rate: 91 },
    { week: 'W5', rate: 87 },
    { week: 'W6', rate: 93 },
]

const alerts = [
    { type: 'warning', msg: '34 students have attendance < 75%', icon: '⚠️' },
    { type: 'error', msg: '3 students with CGPA < 5.0 need counseling', icon: '🔴' },
    { type: 'info', msg: 'Exam schedule to be published by Mar 1', icon: '📅' },
    { type: 'success', msg: '12 students selected in campus placements', icon: '🎉' },
]

const alertColors = { warning: '#f7c948', error: '#ff6b9d', info: '#4fc3f7', success: '#00d4aa' }

export default function AdminDashboard() {
    return (
        <div className="page-wrapper">
            <PageHeader title="Admin Dashboard" subtitle="EduSphere Control Center" role="admin" />
            <div className="page-content" style={{ paddingBottom: 100 }}>

                {/* KPI cards */}
                <div className="grid-2 animate-fadeInUp" style={{ marginBottom: 20, gap: 14 }}>
                    <DashboardCard title="Total Students" value="1,220" icon={GraduationCap} color="var(--accent-gold)" trend="up" trendValue="+48" />
                    <DashboardCard title="Total Staff" value="86" icon={Users} color="var(--accent-purple)" trend="up" trendValue="+4" />
                    <DashboardCard title="Avg Attendance" value="87%" icon={Activity} color="var(--accent-teal)" trend="up" trendValue="+2.1%" />
                    <DashboardCard title="Avg CGPA" value="8.24" icon={Award} color="var(--accent-pink)" trend="down" trendValue="-0.1" />
                </div>

                {/* Quick nav */}
                <div className="animate-fadeInUp delay-1" style={{ marginBottom: 20 }}>
                    <div className="section-title">Quick Access</div>
                    <QuickActions actions={[
                        { label: 'Student Perf.', path: '/admin/student-performance', icon: GraduationCap, color: 'var(--accent-teal)', desc: 'View grades & analysis' },
                        { label: 'Staff Perf.', path: '/admin/staff-performance', icon: Users, color: 'var(--accent-purple)', desc: 'Track teaching stats' },
                        { label: 'User Mgmt', path: '/admin/users', icon: UserCog, color: 'var(--accent-gold)', desc: 'Add/Edit users' },
                        { label: 'Reports', path: '/admin/reports', icon: FileBarChart, color: 'var(--accent-pink)', desc: 'Generate PDF reports' },
                    ]} />
                </div>

                {/* Charts Grid */}
                <div className="grid-1 animate-fadeInUp delay-2" style={{ display: 'grid', gap: 20 }}>
                    {/* Grade distribution pie */}
                    <div style={{ height: 300 }}>
                        <ChartSection title="Grade Distribution">
                            <PieChart>
                                <Pie data={gradeDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" strokeWidth={0} paddingAngle={5}>
                                    {gradeDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f0f0ff', fontSize: 12 }} />
                            </PieChart>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: -20 }}>
                                {gradeDistribution.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </ChartSection>
                    </div>

                    {/* Enrollment bar chart */}
                    <div style={{ height: 280 }}>
                        <ChartSection title="Enrollment">
                            <BarChart data={enrollmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="dept" tick={{ fill: '#9090b0', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#9090b0', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f0f0ff', fontSize: 12 }} />
                                <Bar dataKey="count" radius={[6, 6, 6, 6]} barSize={32}>
                                    {enrollmentData.map((_, i) => (
                                        <Cell key={i} fill={['#6c63ff', '#00d4aa', '#f7c948', '#ff6b9d', '#4fc3f7'][i]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartSection>
                    </div>

                    {/* Weekly attendance area chart */}
                    <div style={{ height: 260 }}>
                        <ChartSection title="Attendance Trend">
                            <AreaChart data={weeklyAttendance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="adminAttGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f7c948" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f7c948" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="week" tick={{ fill: '#9090b0', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis domain={[70, 100]} tick={{ fill: '#9090b0', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f0f0ff', fontSize: 12 }} />
                                <Area type="monotone" dataKey="rate" stroke="#f7c948" strokeWidth={3} fill="url(#adminAttGrad)" dot={{ fill: '#f7c948', strokeWidth: 2, r: 4 }} />
                            </AreaChart>
                        </ChartSection>
                    </div>
                </div>

                {/* Alerts */}
                <div className="animate-fadeInUp delay-4" style={{ marginTop: 20 }}>
                    <div className="section-title">System Alerts</div>
                    <div className="flex-col" style={{ gap: 10 }}>
                        {alerts.map((a, i) => (
                            <div key={i} className="glass-card list-item" style={{ borderLeft: `3px solid ${alertColors[a.type]}` }}>
                                <span style={{ fontSize: '1.2rem' }}>{a.icon}</span>
                                <div style={{ flex: 1, fontSize: '0.85rem' }}>{a.msg}</div>
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
