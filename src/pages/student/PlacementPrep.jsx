import React, { useState } from 'react'
import { Briefcase, TrendingUp, FileText, Star, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react'
import { LayoutDashboard, Camera, Brain, Calendar, Bell } from 'lucide-react'
import BottomNav from '../../components/BottomNav'
import PageHeader from '../../components/PageHeader'
import { RadialBarChart, RadialBar, ResponsiveContainer, Legend } from 'recharts'
import axios from 'axios'

const navItems = [
    { label: 'Home', icon: LayoutDashboard, path: '/student' },
    { label: 'Attend', icon: Camera, path: '/student/attendance' },
    { label: 'AI', icon: Brain, path: '/student/ai-insights' },
    { label: 'Events', icon: Calendar, path: '/student/events' },
    { label: 'Careers', icon: Briefcase, path: '/student/placement' },
]

export default function PlacementPrep() {
    const [form, setForm] = useState({
        cgpa: '', internship_count: '', project_count: '',
        skills: '', communication_score: '7', attendance_pct: '85', backlog_count: '0',
    })
    const [result, setResult] = useState(null)
    const [resumeText, setResumeText] = useState('')
    const [resumeResult, setResumeResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [tab, setTab] = useState('predict')

    const predict = async () => {
        if (!form.cgpa) return
        setLoading(true)
        try {
            const skillsList = form.skills.split(',').map(s => s.trim()).filter(Boolean)
            const { data } = await axios.post('/ml/placement/predict', {
                ...form,
                skills: skillsList,
                cgpa: parseFloat(form.cgpa),
                internship_count: parseInt(form.internship_count) || 0,
                project_count: parseInt(form.project_count) || 0,
                communication_score: parseFloat(form.communication_score) || 7,
                attendance_pct: parseFloat(form.attendance_pct) || 85,
                backlog_count: parseInt(form.backlog_count) || 0,
            })
            setResult(data)
        } catch (e) {
            alert('ML service unavailable. Start Flask on port 5000.')
        } finally {
            setLoading(false)
        }
    }

    const analyseResume = async () => {
        if (!resumeText) return
        setLoading(true)
        try {
            const { data } = await axios.post('/ml/placement/resume', { text: resumeText })
            setResumeResult(data)
        } catch (e) {
            alert('ML service unavailable.')
        } finally {
            setLoading(false)
        }
    }

    const prob = result ? Math.round(result.placement_probability * 100) : 0
    const LVLCOLOR = { High: '#00d4aa', Medium: '#f7c948', Low: '#ff6b9d' }
    const lvlColor = LVLCOLOR[result?.confidence_level] || '#6c63ff'

    return (
        <div className="page-wrapper">
            <PageHeader title="Placement AI" subtitle="Predict your placement readiness" role="student" />
            <div className="page-content" style={{ paddingBottom: 100 }}>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {['predict', 'resume'].map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            flex: 1, padding: '10px 0', borderRadius: 12, fontWeight: 600, fontSize: '0.82rem',
                            border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                            background: tab === t ? 'var(--accent-purple)' : 'rgba(255,255,255,0.06)',
                            color: tab === t ? '#fff' : 'var(--text-secondary)',
                        }}>
                            {t === 'predict' ? '🎯 Placement Score' : '📄 Resume Analyser'}
                        </button>
                    ))}
                </div>

                {tab === 'predict' ? (
                    <>
                        {/* Input Form */}
                        <div className="glass-card animate-fadeInUp" style={{ padding: 16, marginBottom: 16 }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Your Profile</div>
                            <div className="grid-2" style={{ gap: 12 }}>
                                {[
                                    { key: 'cgpa', label: 'CGPA (0-10)', placeholder: '8.2' },
                                    { key: 'internship_count', label: 'Internships', placeholder: '2' },
                                    { key: 'project_count', label: 'Projects', placeholder: '3' },
                                    { key: 'backlog_count', label: 'Backlogs', placeholder: '0' },
                                    { key: 'attendance_pct', label: 'Attendance %', placeholder: '85' },
                                    { key: 'communication_score', label: 'Communication (1-10)', placeholder: '7' },
                                ].map(({ key, label, placeholder }) => (
                                    <div key={key}>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
                                        <input
                                            type="number"
                                            placeholder={placeholder}
                                            value={form[key]}
                                            onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                                            style={{
                                                width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', fontSize: '0.85rem', boxSizing: 'border-box',
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: 12 }}>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Skills (comma-separated)</div>
                                <input
                                    type="text"
                                    placeholder="Python, React, SQL, Machine Learning, AWS"
                                    value={form.skills}
                                    onChange={e => setForm(p => ({ ...p, skills: e.target.value }))}
                                    style={{
                                        width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', fontSize: '0.85rem', boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                            <button onClick={predict} disabled={loading} style={{
                                marginTop: 16, width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
                                background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-teal))',
                                color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                            }}>
                                {loading ? '🤖 Predicting...' : '✨ Predict Placement Score'}
                            </button>
                        </div>

                        {/* Result */}
                        {result && (
                            <div className="animate-fadeInUp">
                                <div className="glass-card" style={{ padding: 20, marginBottom: 16, borderLeft: `4px solid ${lvlColor}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>PLACEMENT PROBABILITY</div>
                                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: lvlColor }}>{prob}%</div>
                                        </div>
                                        <div style={{
                                            background: `${lvlColor}20`, color: lvlColor,
                                            border: `1px solid ${lvlColor}40`,
                                            borderRadius: 20, padding: '6px 16px', fontWeight: 700,
                                        }}>{result.confidence_level}</div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, height: 10, overflow: 'hidden' }}>
                                        <div style={{ width: `${prob}%`, height: '100%', background: `linear-gradient(90deg, ${lvlColor}, ${lvlColor}88)`, borderRadius: 8, transition: 'width 1s' }} />
                                    </div>
                                </div>

                                {/* Improvement Tips */}
                                <div className="glass-card" style={{ padding: 16 }}>
                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <TrendingUp size={16} color="var(--accent-teal)" /> Action Plan
                                    </div>
                                    {(result.improvement_tips || []).map((tip, i) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10,
                                            background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px'
                                        }}>
                                            <div style={{
                                                width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-teal)20',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                            }}>
                                                <ChevronRight size={12} color="var(--accent-teal)" />
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{tip}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Resume Analyser */}
                        <div className="glass-card animate-fadeInUp" style={{ padding: 16, marginBottom: 16 }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Paste Your Resume Text</div>
                            <textarea
                                rows={8}
                                placeholder="Paste your resume content here — we'll analyse keywords, skills, and give you a score..."
                                value={resumeText}
                                onChange={e => setResumeText(e.target.value)}
                                style={{
                                    width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 10, padding: 12, color: 'var(--text-primary)', fontSize: '0.82rem',
                                    resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6,
                                }}
                            />
                            <button onClick={analyseResume} disabled={loading} style={{
                                marginTop: 12, width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
                                background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-gold))',
                                color: '#fff', fontWeight: 700, cursor: 'pointer',
                            }}>
                                {loading ? 'Analysing...' : '🔍 Analyse Resume'}
                            </button>
                        </div>

                        {resumeResult && (
                            <div className="animate-fadeInUp">
                                <div className="glass-card" style={{ padding: 16, marginBottom: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Resume Score</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-teal)' }}>
                                            {resumeResult.keyword_score?.toFixed(0)}%
                                        </div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 6, height: 8, overflow: 'hidden', marginBottom: 16 }}>
                                        <div style={{ width: `${resumeResult.keyword_score}%`, height: '100%', background: 'var(--accent-teal)', borderRadius: 6 }} />
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: 8, color: 'var(--text-secondary)' }}>✅ Found ({resumeResult.tech_keywords?.length} tech)</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                                        {(resumeResult.tech_keywords || []).map(kw => (
                                            <span key={kw} style={{ background: 'var(--accent-teal)20', color: 'var(--accent-teal)', borderRadius: 20, padding: '2px 10px', fontSize: '0.72rem', border: '1px solid var(--accent-teal)30' }}>{kw}</span>
                                        ))}
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: 8, color: 'var(--text-secondary)' }}>⚠️ Missing Top Skills</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {(resumeResult.missing_top || []).slice(0, 6).map(kw => (
                                            <span key={kw} style={{ background: 'var(--accent-pink)20', color: 'var(--accent-pink)', borderRadius: 20, padding: '2px 10px', fontSize: '0.72rem', border: '1px solid var(--accent-pink)30' }}>{kw}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            <BottomNav role="student" items={navItems} />
        </div>
    )
}
