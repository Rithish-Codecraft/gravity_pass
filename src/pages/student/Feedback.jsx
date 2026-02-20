import React, { useState } from 'react'
import { LayoutDashboard, Camera, BookOpen, Star, Calendar, Send, CheckCircle, MessageSquare } from 'lucide-react'
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

const subjects = ['Data Structures', 'Algorithms', 'DBMS', 'Networks', 'Operating Systems']
const aspects = ['Teaching Quality', 'Course Content', 'Accessibility', 'Punctuality']

function StarRating({ value, onChange }) {
    const [hover, setHover] = useState(0)
    return (
        <div className="stars" style={{ gap: 8 }}>
            {[1, 2, 3, 4, 5].map(s => (
                <button
                    key={s}
                    className={`star ${s <= (hover || value) ? 'lit' : ''}`}
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => onChange(s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, fontSize: '1.5rem' }}
                >
                    {s <= (hover || value) ? '⭐' : '☆'}
                </button>
            ))}
        </div>
    )
}

export default function StudentFeedback() {
    const [selectedSubject, setSelectedSubject] = useState(subjects[0])
    const [ratings, setRatings] = useState({})
    const [comments, setComments] = useState('')
    const [anonymous, setAnonymous] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [toast, setToast] = useState(null)

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

    const handleRating = (aspect, val) => setRatings(r => ({ ...r, [aspect]: val }))

    const avgRating = Object.values(ratings).length
        ? (Object.values(ratings).reduce((a, v) => a + v, 0) / Object.values(ratings).length).toFixed(1)
        : 0

    const handleSubmit = () => {
        if (Object.keys(ratings).length < aspects.length) {
            showToast('⚠️ Please rate all aspects!')
            return
        }
        setSubmitting(true)
        setTimeout(() => {
            setSubmitting(false)
            setSubmitted(true)
            showToast('🙏 Feedback submitted! Thank you!')
        }, 1400)
    }

    if (submitted) {
        return (
            <div className="page-wrapper">
                <PageHeader title="Feedback" role="student" back="/student" />
                <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60dvh' }}>
                    <div className="animate-scaleIn" style={{ textAlign: 'center', padding: 20 }}>
                        <div style={{ fontSize: '5rem', marginBottom: 16 }}>🙏</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Thank You!</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.6 }}>
                            Your feedback helps improve teaching quality. It has been submitted {anonymous ? 'anonymously' : ''}.
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} style={{ fontSize: '1.3rem', opacity: s <= Math.round(avgRating) ? 1 : 0.3 }}>⭐</span>
                            ))}
                        </div>
                        <div style={{ color: 'var(--accent-teal)', fontWeight: 700 }}>You rated {avgRating}/5</div>
                        <button className="btn btn-teal btn-lg" style={{ marginTop: 24 }} onClick={() => { setSubmitted(false); setRatings({}); setComments('') }}>
                            Give More Feedback
                        </button>
                    </div>
                </div>
                <BottomNav role="student" items={navItems} />
                <Chatbot accentColor="var(--accent-teal)" />
            </div>
        )
    }

    return (
        <div className="page-wrapper">
            {toast && <div className="toast">{toast}</div>}
            <PageHeader title="Feedback" subtitle="Rate Your Subjects & Teachers" role="student" back="/student" />
            <div className="page-content" style={{ paddingBottom: 100 }}>

                {/* Subject selector */}
                <div className="animate-fadeInUp" style={{ marginBottom: 20 }}>
                    <div className="section-title">Select Subject</div>
                    <div className="tab-bar">
                        {subjects.map(s => (
                            <button
                                key={s}
                                className={`tab-pill ${selectedSubject === s ? 'active' : ''}`}
                                onClick={() => { setSelectedSubject(s); setRatings({}) }}
                                style={{ '--active-color': 'var(--student-primary)' }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Teacher info */}
                <div className="glass-card animate-fadeInUp delay-1" style={{ padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: 'linear-gradient(135deg, var(--accent-purple), #9c6cff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, color: '#fff', fontSize: '1.1rem',
                    }}>P</div>
                    <div>
                        <div style={{ fontWeight: 700 }}>Dr. Priya Menon</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{selectedSubject} · Dept. of CS</div>
                    </div>
                    {avgRating > 0 && (
                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--accent-gold)' }}>{avgRating}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Avg. Rating</div>
                        </div>
                    )}
                </div>

                {/* Aspect ratings */}
                <div className="animate-fadeInUp delay-2" style={{ marginBottom: 20 }}>
                    <div className="section-title">Rate Each Aspect</div>
                    <div className="flex-col" style={{ gap: 16 }}>
                        {aspects.map(aspect => (
                            <div key={aspect} className="glass-card" style={{ padding: '16px' }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 12 }}>{aspect}</div>
                                <StarRating value={ratings[aspect] || 0} onChange={(v) => handleRating(aspect, v)} />
                                {ratings[aspect] && (
                                    <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {['', '😞 Poor', '😕 Below Average', '😐 Average', '😊 Good', '🤩 Excellent'][ratings[aspect]]}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Comments */}
                <div className="animate-fadeInUp delay-3" style={{ marginBottom: 20 }}>
                    <div className="section-title">Additional Comments</div>
                    <textarea
                        className="input-field"
                        placeholder="Share your thoughts... (optional)"
                        value={comments}
                        onChange={e => setComments(e.target.value)}
                        rows={4}
                        style={{ resize: 'none', lineHeight: 1.6 }}
                    />
                </div>

                {/* Anonymous toggle */}
                <div className="animate-fadeInUp delay-4 flex-between glass-card" style={{ padding: '14px 16px', marginBottom: 20 }}>
                    <div>
                        <div style={{ fontWeight: 600 }}>Submit Anonymously</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Your name won't be visible to faculty</div>
                    </div>
                    <label className="toggle">
                        <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />
                        <span className="toggle-slider" />
                    </label>
                </div>

                {/* Submit */}
                <button
                    className="btn btn-teal btn-full btn-lg animate-fadeInUp delay-5"
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{ opacity: submitting ? 0.7 : 1 }}
                >
                    {submitting
                        ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Submitting...</>
                        : <><Send size={18} /> Submit Feedback</>
                    }
                </button>
            </div>
            <BottomNav role="student" items={navItems} />
            <Chatbot accentColor="var(--accent-teal)" />
        </div>
    )
}
