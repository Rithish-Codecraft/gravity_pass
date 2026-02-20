import React, { useState } from 'react'
import { LayoutDashboard, GraduationCap, Users, UserCog, FileBarChart, Download, FilePieChart, FileSpreadsheet, FileText, CheckCircle, Clock } from 'lucide-react'
import BottomNav from '../../components/BottomNav'
import PageHeader from '../../components/PageHeader'
import Chatbot from '../../components/Chatbot'

const navItems = [
    { label: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { label: 'Students', icon: GraduationCap, path: '/admin/student-performance' },
    { label: 'Staff', icon: Users, path: '/admin/staff-performance' },
    { label: 'Users', icon: UserCog, path: '/admin/users' },
    { label: 'Reports', icon: FileBarChart, path: '/admin/reports' },
]

const reportTemplates = [
    { icon: '📊', title: 'Student Performance Report', desc: 'CGPA, grades, rank, all categories', format: ['PDF', 'CSV'], color: 'var(--accent-teal)' },
    { icon: '👨‍🏫', title: 'Staff Performance Report', desc: 'Feedback, attendance, class completion', format: ['PDF', 'XLSX'], color: 'var(--accent-purple)' },
    { icon: '📅', title: 'Attendance Summary', desc: 'Department-wise attendance report', format: ['PDF', 'CSV'], color: 'var(--accent-gold)' },
    { icon: '📝', title: 'Exam Results', desc: 'Semester-wise exam result compilation', format: ['PDF'], color: 'var(--accent-pink)' },
    { icon: '💰', title: 'Fee Collection Report', desc: 'Fee status, dues, collection summary', format: ['PDF', 'XLSX'], color: 'var(--accent-blue)' },
    { icon: '🎓', title: 'Placement Report', desc: 'Campus placement statistics & companies', format: ['PDF', 'CSV'], color: 'var(--accent-orange)' },
]

const recentReports = [
    { title: 'Student Performance Report – Semester 5', generated: 'Feb 18, 2026', by: 'Admin', format: 'PDF', status: 'Ready' },
    { title: 'Attendance Summary – January 2026', generated: 'Feb 1, 2026', by: 'Admin', format: 'CSV', status: 'Ready' },
    { title: 'Fee Collection – Q4 2025', generated: 'Jan 5, 2026', by: 'Admin', format: 'XLSX', status: 'Ready' },
]

export default function AdminReports() {
    const [generating, setGenerating] = useState(null)
    const [generated, setGenerated] = useState([])
    const [toast, setToast] = useState(null)
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

    const handleGenerate = (report, format) => {
        const key = `${report.title}-${format}`
        setGenerating(key)
        setTimeout(() => {
            setGenerating(null)
            setGenerated(prev => [...prev, key])
            showToast(`📄 ${report.title} (${format}) ready!`)
        }, 2000)
    }

    return (
        <div className="page-wrapper">
            {toast && <div className="toast">{toast}</div>}
            <PageHeader title="Reports" subtitle="Generate & Download Reports" role="admin" back="/admin" />
            <div className="page-content" style={{ paddingBottom: 100 }}>

                {/* Date range */}
                <div className="animate-fadeInUp glass-card" style={{ padding: 16, marginBottom: 20 }}>
                    <div className="section-title" style={{ marginBottom: 12 }}>Report Period</div>
                    <div className="grid-2" style={{ gap: 10 }}>
                        <div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 5 }}>From</div>
                            <input type="date" className="input-field" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 5 }}>To</div>
                            <input type="date" className="input-field" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Templates */}
                <div className="animate-fadeInUp delay-1" style={{ marginBottom: 24 }}>
                    <div className="section-title">Report Templates</div>
                    <div className="flex-col" style={{ gap: 12 }}>
                        {reportTemplates.map((r, i) => {
                            return (
                                <div key={i} className="glass-card" style={{ padding: 16, borderLeft: `3px solid ${r.color}` }}>
                                    <div className="flex-row" style={{ gap: 12, marginBottom: 10 }}>
                                        <div style={{ fontSize: '1.8rem' }}>{r.icon}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>{r.desc}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {r.format.map(fmt => {
                                            const key = `${r.title}-${fmt}`
                                            const isGenerating = generating === key
                                            const isDone = generated.includes(key)
                                            return (
                                                <button
                                                    key={fmt}
                                                    className="btn btn-sm"
                                                    onClick={() => handleGenerate(r, fmt)}
                                                    disabled={isGenerating}
                                                    style={{
                                                        background: isDone ? 'rgba(0,212,170,0.15)' : `${r.color}20`,
                                                        color: isDone ? 'var(--accent-teal)' : r.color,
                                                        border: `1px solid ${isDone ? 'rgba(0,212,170,0.3)' : r.color + '44'}`,
                                                        flex: 1, justifyContent: 'center',
                                                        opacity: isGenerating ? 0.7 : 1,
                                                    }}
                                                >
                                                    {isGenerating ? (
                                                        <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: r.color, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                                    ) : isDone ? (
                                                        <><CheckCircle size={13} /> {fmt} Ready</>
                                                    ) : (
                                                        <><Download size={13} /> {fmt}</>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Recent reports */}
                <div className="animate-fadeInUp delay-3">
                    <div className="section-title">Recent Reports</div>
                    <div className="flex-col" style={{ gap: 10 }}>
                        {recentReports.map((r, i) => (
                            <div key={i} className="list-item">
                                <div style={{
                                    width: 38, height: 38, borderRadius: 10,
                                    background: 'rgba(247,201,72,0.12)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 800, fontSize: '0.65rem', color: 'var(--accent-gold)',
                                }}>{r.format}</div>
                                <div style={{ flex: 1 }}>
                                    <div className="list-item-title">{r.title}</div>
                                    <div className="list-item-sub">{r.generated} · By {r.by}</div>
                                </div>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => showToast(`📥 ${r.title} downloaded!`)}
                                    style={{ padding: '6px 12px' }}
                                >
                                    <Download size={13} />
                                </button>
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
