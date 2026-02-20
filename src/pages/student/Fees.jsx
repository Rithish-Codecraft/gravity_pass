import React, { useState } from 'react'
import { LayoutDashboard, Camera, BookOpen, Star, Calendar, CreditCard, CheckCircle, AlertCircle, Download, ArrowRight } from 'lucide-react'
import BottomNav from '../../components/BottomNav'
import PageHeader from '../../components/PageHeader'
import Chatbot from '../../components/Chatbot'

const navItems = [
    { label: 'Home', icon: LayoutDashboard, path: '/student' },
    { label: 'Attendance', icon: Camera, path: '/student/face-attendance' },
    { label: 'Results', icon: BookOpen, path: '/student/results' },
    { label: 'Feedback', icon: Star, path: '/student/feedback' },
    { label: 'More', icon: Calendar, path: '/student/events' },
]

const feeItems = [
    { id: 1, title: 'Tuition Fee – Semester 6', amount: 45000, due: 'Mar 15, 2026', status: 'Pending', category: 'Academic' },
    { id: 2, title: 'Hostel Fee – Q1 2026', amount: 15000, due: 'Feb 28, 2026', status: 'Overdue', category: 'Hostel' },
    { id: 3, title: 'Library & Lab Fee', amount: 3500, due: 'Mar 15, 2026', status: 'Pending', category: 'Academic' },
    { id: 4, title: 'Tuition Fee – Semester 5', amount: 45000, due: 'Sep 15, 2025', status: 'Paid', category: 'Academic', paidOn: 'Sep 12, 2025' },
    { id: 5, title: 'Hostel Fee – Q3 2025', amount: 15000, due: 'Jul 30, 2025', status: 'Paid', category: 'Hostel', paidOn: 'Jul 28, 2025' },
]

const statusColors = { Paid: 'var(--accent-teal)', Pending: 'var(--accent-gold)', Overdue: 'var(--accent-pink)' }
const statusBadge = { Paid: 'badge-teal', Pending: 'badge-gold', Overdue: 'badge-pink' }

export default function StudentFees() {
    const [paying, setPaying] = useState(null)
    const [paid, setPaid] = useState([])
    const [toast, setToast] = useState(null)
    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

    const pendingFees = feeItems.filter(f => f.status !== 'Paid' && !paid.includes(f.id))
    const paidFees = feeItems.filter(f => f.status === 'Paid' || paid.includes(f.id))
    const totalDue = pendingFees.reduce((a, f) => a + f.amount, 0)

    const handlePay = (fee) => {
        setPaying(fee.id)
        setTimeout(() => {
            setPaying(null)
            setPaid(prev => [...prev, fee.id])
            showToast(`✅ ₹${fee.amount.toLocaleString()} paid successfully!`)
        }, 1800)
    }

    return (
        <div className="page-wrapper">
            {toast && <div className="toast">{toast}</div>}
            <PageHeader title="Fee Status" subtitle="Fee Payments Dashboard" role="student" back="/student" />
            <div className="page-content" style={{ paddingBottom: 100 }}>

                {/* Summary */}
                <div className="animate-fadeInUp glass-card" style={{
                    padding: 20, marginBottom: 20,
                    background: totalDue > 0
                        ? 'linear-gradient(135deg, rgba(247,201,72,0.12), rgba(255,138,101,0.08))'
                        : 'linear-gradient(135deg, rgba(0,212,170,0.12), rgba(0,184,212,0.06))',
                    borderColor: totalDue > 0 ? 'rgba(247,201,72,0.3)' : 'rgba(0,212,170,0.3)',
                }}>
                    <div className="flex-between">
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                                Total Amount Due
                            </div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 900, color: totalDue > 0 ? 'var(--accent-gold)' : 'var(--accent-teal)' }}>
                                ₹{totalDue.toLocaleString()}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Status</div>
                            <span className={`badge ${totalDue > 0 ? 'badge-gold' : 'badge-teal'}`} style={{ fontSize: '0.78rem', padding: '5px 12px' }}>
                                {totalDue > 0 ? `${pendingFees.length} Pending` : '✓ All Clear'}
                            </span>
                        </div>
                    </div>
                    <div className="progress-bar" style={{ marginTop: 16 }}>
                        <div className="progress-fill" style={{
                            width: `${100 - (totalDue / feeItems.reduce((a, f) => a + f.amount, 0) * 100)}%`,
                            background: 'linear-gradient(90deg, var(--accent-teal), #00b8d4)',
                        }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        <span>{paidFees.length} paid</span>
                        <span>{pendingFees.length} pending</span>
                    </div>
                </div>

                {/* Pending fees */}
                {pendingFees.length > 0 && (
                    <div className="animate-fadeInUp delay-1" style={{ marginBottom: 24 }}>
                        <div className="section-title">Pending Payments</div>
                        <div className="flex-col" style={{ gap: 12 }}>
                            {pendingFees.map(fee => (
                                <div key={fee.id} className="glass-card" style={{ padding: 16, borderLeft: `3px solid ${statusColors[fee.status]}` }}>
                                    <div className="flex-between" style={{ marginBottom: 8 }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{fee.title}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>Due: {fee.due}</div>
                                        </div>
                                        <span className={`badge ${statusBadge[fee.status]}`}>{fee.status}</span>
                                    </div>
                                    <div className="flex-between">
                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                            ₹{fee.amount.toLocaleString()}
                                        </div>
                                        <button
                                            className="btn btn-sm"
                                            style={{
                                                background: 'linear-gradient(135deg, var(--accent-teal), #00b8d4)',
                                                color: '#fff',
                                                boxShadow: '0 4px 16px rgba(0,212,170,0.3)',
                                                opacity: paying === fee.id ? 0.7 : 1,
                                            }}
                                            onClick={() => handlePay(fee)}
                                            disabled={paying === fee.id}
                                        >
                                            {paying === fee.id
                                                ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                                : <><CreditCard size={14} /> Pay Now</>
                                            }
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Paid fees */}
                <div className="animate-fadeInUp delay-2">
                    <div className="section-title">Payment History</div>
                    <div className="flex-col" style={{ gap: 10 }}>
                        {paidFees.map(fee => (
                            <div key={fee.id} className="glass-card" style={{ padding: '14px 16px', borderLeft: '3px solid var(--accent-teal)' }}>
                                <div className="flex-between">
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{fee.title}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                                            Paid on {fee.paidOn || 'Today'}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>₹{fee.amount.toLocaleString()}</div>
                                        <CheckCircle size={14} color="var(--accent-teal)" style={{ marginTop: 4 }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="btn btn-ghost btn-full btn-sm" style={{ marginTop: 16 }} onClick={() => showToast('📄 Receipt downloaded!')}>
                        <Download size={14} /> Download All Receipts
                    </button>
                </div>
            </div>
            <BottomNav role="student" items={navItems} />
            <Chatbot accentColor="var(--accent-teal)" />
        </div>
    )
}
