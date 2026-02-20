import React, { useState, useEffect } from 'react'
import { Brain, TrendingUp, AlertTriangle, CheckCircle, BarChart2, Award } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Camera, FileText, Calendar, Bell } from 'lucide-react'
import BottomNav from '../../components/BottomNav'
import PageHeader from '../../components/PageHeader'
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import axios from 'axios'
import { getUser } from '../../api/auth'
import { getDashboard as getStudentDashboard } from '../../api/student'

const navItems = [
    { label: 'Home', icon: LayoutDashboard, path: '/student' },
    { label: 'Attend', icon: Camera, path: '/student/attendance' },
    { label: 'Results', icon: FileText, path: '/student/results' },
    { label: 'Events', icon: Calendar, path: '/student/events' },
    { label: 'AI', icon: Brain, path: '/student/ai-insights' },
]

const RISK_COLORS = { Low: '#00d4aa', Medium: '#f7c948', High: '#ff6b9d' }

export default function AIInsights() {
    const [loading, setLoading] = useState(true)
    const [insights, setInsights] = useState(null)
    const [error, setError] = useState(null)
    const user = getUser()

    useEffect(() => {
        const fetchAll = async () => {
            try {
                // Grab student profile from Express
                const dash = await getStudentDashboard()
                const sid = dash?.student?.id

                // Then hit Flask ML service
                const STUDENT_ID = sid || 1
                const { data } = await axios.get(`/ml/analytics/student/${STUDENT_ID}`)
                setInsights(data)
            } catch (e) {
                console.error(e)
                setError('ML service unavailable — make sure Flask is running on :5000')
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    if (loading) return (
        <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
            <div style={{ textAlign: 'center' }}>
                <Brain size={48} color="var(--accent-purple)" style={{ animation: 'pulse 1.5s ease-in-out infinite', marginBottom: 16 }} />
                <div style={{ color: 'var(--text-secondary)' }}>AI analysing your profile...</div>
            </div>
        </div>
    )

    if (error) return (
        <div className="page-wrapper">
            <PageHeader title="AI Insights" role="student" />
            <div className="page-content" style={{ padding: 20 }}>
                <div className="glass-card" style={{ padding: 24, textAlign: 'center', borderColor: 'var(--accent-pink)' }}>
                    <AlertTriangle size={32} color="var(--accent-pink)" style={{ marginBottom: 12 }} />
                    <div style={{ color: 'var(--text-primary)', marginBottom: 8, fontWeight: 600 }}>ML Service Not Connected</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{error}</div>
                    <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 12, fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent-teal)', textAlign: 'left' }}>
                        cd ml-service<br />pip install -r requirements.txt<br />python app.py
                    </div>
                </div>
            </div>
            <BottomNav role="student" items={navItems} />
        </div>
    )

    const { profile, prediction, averages, attendance_pct, backlog_count, sgpa_trend } = insights || {}
    const risk = prediction?.risk_level || 'Medium'
    const passPct = ((prediction?.pass_probability || 0.75) * 100).toFixed(1)

    const radarData = [
        { subject: 'Internal', score: Math.round((averages?.internal || 15) / 25 * 100) },
        { subject: 'External', score: Math.round((averages?.external || 55) / 75 * 100) },
        { subject: 'Attendance', score: Math.round(attendance_pct || 80) },
        { subject: 'CGPA', score: Math.round((profile?.cgpa || 7.5) / 10 * 100) },
        { subject: 'Backlogs', score: Math.max(0, 100 - (backlog_count || 0) * 20) },
    ]

    return (
        <div className="page-wrapper">
            <PageHeader title="AI Insights" subtitle="ML-powered performance analysis" role="student" />
            <div className="page-content" style={{ paddingBottom: 100 }}>

                {/* Pass/Fail Prediction Card */}
                <div className="glass-card animate-fadeInUp" style={{
                    marginBottom: 16, padding: 20,
                    borderLeft: `4px solid ${RISK_COLORS[risk]}`,
                    background: `linear-gradient(135deg, ${RISK_COLORS[risk]}10, var(--surface-elevated))`,
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: 4 }}>AI PREDICTION</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: RISK_COLORS[risk] }}>{passPct}%</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pass Probability</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{
                                background: `${RISK_COLORS[risk]}20`, color: RISK_COLORS[risk],
                                border: `1px solid ${RISK_COLORS[risk]}40`,
                                borderRadius: 20, padding: '6px 16px', fontWeight: 700, fontSize: '0.9rem',
                            }}>{risk} Risk</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                                {prediction?.trained ? 'Random Forest Model' : 'Heuristic Score'}
                            </div>
                        </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, height: 8, overflow: 'hidden' }}>
                        <div style={{
                            width: `${passPct}%`, height: '100%',
                            background: `linear-gradient(90deg, ${RISK_COLORS[risk]}, ${RISK_COLORS[risk]}aa)`,
                            borderRadius: 8, transition: 'width 1s ease',
                        }} />
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid-2 animate-fadeInUp delay-1" style={{ marginBottom: 16 }}>
                    <div className="stat-card" style={{ borderLeft: '3px solid var(--accent-teal)' }}>
                        <div className="stat-label">Internal Avg</div>
                        <div className="stat-number" style={{ color: 'var(--accent-teal)' }}>{averages?.internal?.toFixed(1) || '--'}<span style={{ fontSize: '0.7rem' }}>/25</span></div>
                    </div>
                    <div className="stat-card" style={{ borderLeft: '3px solid var(--accent-purple)' }}>
                        <div className="stat-label">External Avg</div>
                        <div className="stat-number" style={{ color: 'var(--accent-purple)' }}>{averages?.external?.toFixed(1) || '--'}<span style={{ fontSize: '0.7rem' }}>/75</span></div>
                    </div>
                    <div className="stat-card" style={{ borderLeft: '3px solid var(--accent-gold)' }}>
                        <div className="stat-label">Attendance</div>
                        <div className="stat-number" style={{ color: (attendance_pct || 80) >= 75 ? 'var(--accent-teal)' : 'var(--accent-pink)' }}>
                            {(attendance_pct || 80).toFixed(1)}%
                        </div>
                    </div>
                    <div className="stat-card" style={{ borderLeft: '3px solid var(--accent-pink)' }}>
                        <div className="stat-label">Backlogs</div>
                        <div className="stat-number" style={{ color: backlog_count > 0 ? 'var(--accent-pink)' : 'var(--accent-teal)' }}>
                            {backlog_count || 0}
                        </div>
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="chart-container animate-fadeInUp delay-2" style={{ marginBottom: 16 }}>
                    <div className="chart-title">Performance Radar</div>
                    <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                            <PolarGrid stroke="rgba(255,255,255,0.06)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9090b0', fontSize: 11 }} />
                            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar dataKey="score" stroke="#6c63ff" fill="#6c63ff" fillOpacity={0.3} strokeWidth={2} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* SGPA Trend */}
                {sgpa_trend && sgpa_trend.length > 0 && (
                    <div className="chart-container animate-fadeInUp delay-3" style={{ marginBottom: 16 }}>
                        <div className="chart-title">SGPA Trend</div>
                        <ResponsiveContainer width="100%" height={130}>
                            <LineChart data={sgpa_trend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="semester" tick={{ fill: '#9090b0', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'Semester', position: 'insideBottom', fill: '#9090b0', fontSize: 10 }} />
                                <YAxis domain={[0, 10]} tick={{ fill: '#9090b0', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f0f0ff', fontSize: 12 }} />
                                <Line type="monotone" dataKey="sgpa" stroke="#00d4aa" strokeWidth={2.5} dot={{ fill: '#00d4aa', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Feature importance tip */}
                <div className="glass-card animate-fadeInUp delay-4" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <Brain size={18} color="var(--accent-purple)" />
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>What drives your score?</div>
                    </div>
                    {[
                        { label: 'External Marks', weight: 35, color: 'var(--accent-purple)' },
                        { label: 'CGPA', weight: 25, color: 'var(--accent-teal)' },
                        { label: 'Attendance', weight: 20, color: 'var(--accent-gold)' },
                        { label: 'Backlogs', weight: 20, color: 'var(--accent-pink)' },
                    ].map(f => (
                        <div key={f.label} style={{ marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 3 }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
                                <span style={{ color: f.color, fontWeight: 600 }}>{f.weight}%</span>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 5 }}>
                                <div style={{ width: `${f.weight}%`, height: '100%', background: f.color, borderRadius: 4 }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <BottomNav role="student" items={navItems} />
        </div>
    )
}
