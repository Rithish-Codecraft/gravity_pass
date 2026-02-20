import React, { useState } from 'react'
import { LayoutDashboard, ClipboardCheck, BookOpen, Calendar, FileText, Upload, X, Eye, Download, Tag, Clock } from 'lucide-react'
import BottomNav from '../../components/BottomNav'
import PageHeader from '../../components/PageHeader'
import Chatbot from '../../components/Chatbot'

const navItems = [
    { label: 'Home', icon: LayoutDashboard, path: '/staff' },
    { label: 'Attendance', icon: ClipboardCheck, path: '/staff/attendance' },
    { label: 'Notes', icon: BookOpen, path: '/staff/notes' },
    { label: 'Timetable', icon: Calendar, path: '/staff/timetable' },
    { label: 'More', icon: FileText, path: '/staff/announcements' },
]

const subjects = ['Data Structures', 'Algorithms', 'DBMS', 'Networks', 'OS']

const uploadedNotes = [
    { id: 1, title: 'Unit 3 - Trees & Graphs', subject: 'Data Structures', date: 'Feb 18, 2026', size: '2.4 MB', type: 'PDF', views: 124, downloads: 87 },
    { id: 2, title: 'Sorting Algorithms (with Examples)', subject: 'Algorithms', date: 'Feb 16, 2026', size: '1.8 MB', type: 'PDF', views: 98, downloads: 72 },
    { id: 3, title: 'SQL Lab Manual', subject: 'DBMS', date: 'Feb 12, 2026', size: '3.1 MB', type: 'DOCX', views: 156, downloads: 112 },
    { id: 4, title: 'OSI Model Slides', subject: 'Networks', date: 'Feb 10, 2026', size: '4.2 MB', type: 'PPTX', views: 89, downloads: 54 },
]

export default function StaffNotes() {
    const [dragOver, setDragOver] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)
    const [title, setTitle] = useState('')
    const [subject, setSubject] = useState(subjects[0])
    const [uploading, setUploading] = useState(false)
    const [uploaded, setUploaded] = useState(false)
    const [toast, setToast] = useState(null)
    const [filter, setFilter] = useState('All')

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

    const handleDrop = (e) => {
        e.preventDefault(); setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) setSelectedFile(file)
    }
    const handleFileInput = (e) => { if (e.target.files[0]) setSelectedFile(e.target.files[0]) }

    const handleUpload = () => {
        if (!selectedFile || !title) { showToast('⚠️ Add title and select a file!'); return }
        setUploading(true)
        setTimeout(() => { setUploading(false); setUploaded(true); showToast('✅ Notes uploaded successfully!'); }, 1800)
    }

    const typeColors = { PDF: 'var(--accent-pink)', DOCX: 'var(--accent-blue)', PPTX: 'var(--accent-gold)' }
    const filteredNotes = filter === 'All' ? uploadedNotes : uploadedNotes.filter(n => n.subject === filter)

    return (
        <div className="page-wrapper">
            {toast && <div className="toast">{toast}</div>}
            <PageHeader title="Notes" subtitle="Upload & Manage Study Materials" role="staff" back="/staff" />
            <div className="page-content" style={{ paddingBottom: 100 }}>

                {/* Upload zone */}
                <div className="animate-fadeInUp" style={{ marginBottom: 20 }}>
                    <div className="section-title">Upload New Notes</div>

                    <div
                        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-input').click()}
                        style={{ marginBottom: 14 }}
                    >
                        <input id="file-input" type="file" style={{ display: 'none' }} accept=".pdf,.docx,.pptx,.ppt,.doc" onChange={handleFileInput} />
                        {selectedFile ? (
                            <div>
                                <div style={{ fontSize: '2rem', marginBottom: 8 }}>📄</div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{selectedFile.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                            </div>
                        ) : (
                            <div>
                                <Upload size={32} color="var(--text-secondary)" style={{ margin: '0 auto 12px' }} />
                                <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Drag & drop or tap to upload</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>PDF, DOCX, PPTX supported</div>
                            </div>
                        )}
                    </div>

                    <input className="input-field" placeholder="Notes title..." value={title} onChange={e => setTitle(e.target.value)} style={{ marginBottom: 10 }} />
                    <select className="input-field" value={subject} onChange={e => setSubject(e.target.value)} style={{ marginBottom: 14 }}>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <button
                        className={`btn btn-primary btn-full ${uploading ? '' : ''}`}
                        onClick={handleUpload}
                        disabled={uploading}
                        style={{ opacity: uploading ? 0.7 : 1 }}
                    >
                        {uploading ? (
                            <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Uploading...</>
                        ) : (
                            <><Upload size={16} /> Upload Notes</>
                        )}
                    </button>
                </div>

                <div className="divider" />

                {/* Uploaded notes */}
                <div className="animate-fadeInUp delay-2">
                    <div className="flex-between" style={{ marginBottom: 14 }}>
                        <div className="section-title" style={{ marginBottom: 0 }}>Uploaded Notes</div>
                        <span className="badge badge-teal">{uploadedNotes.length} files</span>
                    </div>

                    {/* Subject filter */}
                    <div className="tab-bar" style={{ marginBottom: 14 }}>
                        {['All', ...subjects].map(s => (
                            <button key={s} className={`tab-pill ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s}</button>
                        ))}
                    </div>

                    <div className="flex-col" style={{ gap: 10 }}>
                        {filteredNotes.map(note => (
                            <div key={note.id} className="glass-card" style={{ padding: '16px' }}>
                                <div className="flex-between" style={{ marginBottom: 10 }}>
                                    <div className="flex-row" style={{ gap: 10 }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 10,
                                            background: typeColors[note.type] + '20',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.65rem', fontWeight: 800, color: typeColors[note.type],
                                        }}>{note.type}</div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{note.title}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', fontWeight: 600 }}>{note.subject}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-between" style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                                    <div className="flex-row" style={{ gap: 12 }}>
                                        <span><Eye size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{note.views}</span>
                                        <span><Download size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{note.downloads}</span>
                                        <span>{note.size}</span>
                                    </div>
                                    <span>{note.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <BottomNav role="staff" items={navItems} />
            <Chatbot accentColor="var(--accent-purple)" />
        </div>
    )
}
