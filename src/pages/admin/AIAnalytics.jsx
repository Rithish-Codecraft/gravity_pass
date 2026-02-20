import React, { useState, useEffect } from 'react'
import { Brain, Users, AlertTriangle, TrendingUp, Award, BarChart2, RefreshCw } from 'lucide-react'
import { LayoutDashboard, Camera, FileText, Calendar, Bell } from 'lucide-react'
import BottomNav from '../../components/BottomNav'
import PageHeader from '../../components/PageHeader'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'
import axios from 'axios'

const navItems = [
    { label: 'Home', icon: LayoutDashboard, path: '/admin' },
    { label: 'Students', icon: Users, path: '/admin/students' },
    { label: 'AI', icon: Brain, path: '/admin/ai-analytics' },
    { label: 'Reports', icon: FileText, path: '/admin/reports' },
    { label: 'Users', icon: Bell, path: '/admin/users' },
]

const GRADE_COLORS = { 'O': '#6c63ff', 'A+': '#00d4aa', 'A': '#4fc3f7', 'B+': '#f7c948', 'B': '#ff9f43', 'C': '#ff6b9d', 'P': '#a29bfe', 'F': '#fd79a8' }
const DEPT_COLORS = ['#6c63ff', '#00d4aa', '#f7c948', '#ff6b9d', '#4fc3f7', '#ff9f43']

export default function AIAnalytics() {
    const [dashboard, setDashboard] = useState(null)
    const [alerts, setAlerts] = useState(null)
    const [gradeDist, setGradeDist] = useState(null)
    const [deptData, setDeptData] = useState(null)
    const [attTrend, setAttTrend] = useState(null)
    const [toppers, setToppers] = useState(null)
    const [training, setTraining] = useState(false)
    const [loading, setLoading] = useState(true)
    const [mlOnline, setMlOnline] = useState(false)

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [d, a, g, dept, att, top] = await Promise.all([
                axios.get('/ml/admin/dashboard'),
                axios.get('/ml/admin/alerts'),
                axios.get('/ml/admin/grade-dist'),
                axios.get('/ml/admin/dept-summary'),
                axios.get('/ml/admin/attendance-trend'),
                axios.get('/ml/analytics/toppers?n=5'),
            ])
            setDashboard(d.data); setAlerts(a.data); setGradeDist(g.data)
            setDeptData(dept.data); setAttTrend(att.data); setToppers(top.data)
            setMlOnline(true)
        } catch { setMlOnline(false) }
        finally { setLoading(false) }
    }

    const trainModels = async () => {
        setTraining(true)
        try {
            const { data } = await axios.post('/ml/admin/train')
            alert(`✅ Models trained!\nPerformance: ${(data.results?.performance?.accuracy * 100)?.toFixed(1)}%\nPlacement: ${(data.results?.placement?.accuracy * 100)?.toFixed(1)}%`)
        } catch { alert('Training failed — check ML service logs') }
        finally { setTraining(false) }
    }

    if (loading) return (
        <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
            <div style={{ textAlign: 'center' }}>
                <Brain size={48} color="var(--accent-purple)" style={{ marginBottom: 16 }} />
                <div style={{ color: 'var(--text-secondary)' }}>Loading AI analytics...</div>
            </div>
        </div>
    )

    if (!mlOnline) return (
        <div className="page-wrapper">
            <PageHeader title="AI Analytics" role="admin" />
            <div className="page-content" style={{ padding: 20 }}>
                <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
                    <AlertTriangle size={32} color="var(--accent-gold)" style={{ marginBottom: 12 }} />
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>ML Service Offline</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: 16 }}>
                        Start the Flask ML service to see AI analytics.
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 14, fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent-teal)', textAlign: 'left' }}>
                        cd ml-service<br />pip install -r requirements.txt<br />python app.py
                    </div>
                    <button onClick={fetchData} style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, border: 'none', background: 'var(--accent-purple)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                        🔄 Retry
                    </button>
                </div>
            </div>
            <BottomNav role="admin" items={navItems} />
        </div>
    )

    const kpis = [
        { label: 'Total Students', value: dashboard?.total_students, color: 'var(--accent-purple)', icon: Users },
        { label: 'Avg Attendance', value: `${dashboard?.avg_attendance_pct}%`, color: 'var(--accent-teal)', icon: Camera },
        { label: 'Pass Rate', value: `${dashboard?.pass_pct}%`, color: 'var(--accent-gold)', icon: Award },
        { label: 'Placement Rate', value: `${dashboard?.placement_pct}%`, color: 'var(--accent-pink)', icon: TrendingUp },
        { label: 'Avg CGPA', value: dashboard?.avg_cgpa, color: 'var(--accent-purple)', icon: BarChart2 },
        { label: 'High Risk', value: dashboard?.high_risk_students, color: '#ff6b9d', icon: AlertTriangle },
    ]

    return (
        <div className="page-wrapper">
            <PageHeader title="AI Analytics" subtitle="ML-powered department insights" role="admin" />
            <div className="page-content" style={{ paddingBottom: 100 }}>

                {/* Train button */}
                <button onClick={trainModels} disabled={training} style={{
                    width: '100%', marginBottom: 16, padding: '12px 0', borderRadius: 14, border: 'none',
                    background: training ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, var(--accent-purple), var(--accent-teal))',
                    color: training ? 'var(--text-secondary)' : '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                }}>
                    {training ? '🤖 Training ML Models...' : '🧠 Re-Train ML Models from DB'}
                </button>

                {/* KPI Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                    {kpis.map(k => (
                        <div key={k.label} className="stat-card animate-fadeInUp" style={{ borderLeft: `3px solid ${k.color}`, padding: '12px 10px' }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: 2 }}>{k.label}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: k.color }}>{k.value ?? '--'}</div>
                        </div>
                    ))}
                </div>

                {/* Alerts */}
                {alerts?.alerts?.length > 0 && (
                    <div className="animate-fadeInUp" style={{ marginBottom: 16 }}>
                        <div className="section-title">⚠️ System Alerts ({alerts.total})</div>
                        {alerts.alerts.map((a, i) => (
                            <div key={i} className="glass-card" style={{
                                marginBottom: 10, padding: 14,
                                borderLeft: `3px solid ${a.severity === 'high' ? 'var(--accent-pink)' : 'var(--accent-gold)'}`,
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{a.message}</div>
                                    <span style={{
                                        fontSize: '0.65rem', padding: '2px 8px', borderRadius: 10, fontWeight: 700,
                                        background: a.severity === 'high' ? 'rgba(255,107,157,0.15)' : 'rgba(247,201,72,0.15)',
                                        color: a.severity === 'high' ? 'var(--accent-pink)' : 'var(--accent-gold)',
                                    }}>{a.severity.toUpperCase()}</span>
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                    Type: {a.type} · {a.students?.length || 0} students
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Grade Distribution */}
                {gradeDist?.distribution?.length > 0 && (
                    <div className="chart-container animate-fadeInUp" style={{ marginBottom: 16 }}>
                        <div className="chart-title">Grade Distribution</div>
                        <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={gradeDist.distribution} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="grade" tick={{ fill: '#9090b0', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#9090b0', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f0f0ff', fontSize: 12 }} />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {gradeDist.distribution.map((entry, i) => (
                                        <Cell key={i} fill={GRADE_COLORS[entry.grade] || '#6c63ff'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Attendance Trend */}
                {attTrend?.trend?.length > 0 && (
                    <div className="chart-container animate-fadeInUp" style={{ marginBottom: 16 }}>
                        <div className="chart-title">30-Day Attendance Trend</div>
                        <ResponsiveContainer width="100%" height={130}>
                            <LineChart data={attTrend.trend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" tick={{ fill: '#9090b0', fontSize: 9 }} axisLine={false} tickLine={false}
                                    tickFormatter={d => d.slice(5)} />
                                <YAxis domain={[50, 100]} tick={{ fill: '#9090b0', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f0f0ff', fontSize: 12 }} />
                                <Line type="monotone" dataKey="pct" stroke="#00d4aa" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Dept Summary */}
                {deptData?.departments?.length > 0 && (
                    <div className="animate-fadeInUp">
                        <div className="section-title">Department Overview</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {deptData.departments.map((d, i) => (
                                <div key={i} className="list-item" style={{ borderLeft: `3px solid ${DEPT_COLORS[i % DEPT_COLORS.length]}` }}>
                                    <div style={{ flex: 1 }}>
                                        <div className="list-item-title">{d.dept}</div>
                                        <div className="list-item-sub">{d.students} students · CGPA {d.avg_cgpa} · Att {d.avg_att}%</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-teal)' }}>{d.placed} placed</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Top Performers */}
                {toppers?.toppers?.length > 0 && (
                    <div className="animate-fadeInUp" style={{ marginTop: 16 }}>
                        <div className="section-title">🏆 Top Performers</div>
                        {toppers.toppers.map((s, i) => (
                            <div key={i} className="list-item" style={{ borderLeft: `3px solid var(--accent-gold)` }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-gold)20',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--accent-gold)', fontSize: '0.85rem'
                                }}>
                                    {i + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="list-item-title">{s.name}</div>
                                    <div className="list-item-sub">{s.roll_no} · {s.dept}</div>
                                </div>
                                <div style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>{s.cgpa}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <BottomNav role="admin" items={navItems} />
        </div>
    )
}
