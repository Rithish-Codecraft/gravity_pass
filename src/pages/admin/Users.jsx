import React, { useState } from 'react'
import { LayoutDashboard, GraduationCap, Users, UserCog, FileBarChart, Plus, Search, Shield, Edit2, Trash2, ChevronDown, MoreVertical } from 'lucide-react'
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

const allUsers = [
    { id: 1, name: 'Dr. Priya Menon', email: 'priya@edu.ac.in', role: 'Staff', dept: 'CSE', status: 'Active', joined: 'Aug 2020', avatar: 'P' },
    { id: 2, name: 'Arjun Sharma', email: 'arjun21@edu.ac.in', role: 'Student', dept: 'CSE', status: 'Active', joined: 'Jun 2021', avatar: 'A' },
    { id: 3, name: 'Ram Krishnan', email: 'admin@edu.ac.in', role: 'Admin', dept: 'Admin', status: 'Active', joined: 'Jan 2018', avatar: 'R' },
    { id: 4, name: 'Prof. Vikram Nair', email: 'vikram@edu.ac.in', role: 'Staff', dept: 'MECH', status: 'Inactive', joined: 'Jul 2019', avatar: 'V' },
    { id: 5, name: 'Meera Iyer', email: 'meera21@edu.ac.in', role: 'Student', dept: 'CSE', status: 'Active', joined: 'Jun 2021', avatar: 'M' },
    { id: 6, name: 'Sneha Patel', email: 'sneha21@edu.ac.in', role: 'Student', dept: 'ECE', status: 'Active', joined: 'Jun 2021', avatar: 'S' },
    { id: 7, name: 'Dr. Ananya Pillai', email: 'ananya@edu.ac.in', role: 'Staff', dept: 'ECE', status: 'Active', joined: 'Jan 2022', avatar: 'A' },
]

const roleColors = { Admin: 'var(--accent-gold)', Staff: 'var(--accent-purple)', Student: 'var(--accent-teal)' }
const roleBg = { Admin: 'rgba(247,201,72,0.15)', Staff: 'rgba(108,99,255,0.15)', Student: 'rgba(0,212,170,0.15)' }
const statusColors = { Active: 'var(--accent-teal)', Inactive: 'var(--accent-pink)' }

export default function AdminUsers() {
    const [users, setUsers] = useState(allUsers)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('All')
    const [toast, setToast] = useState(null)
    const [showAdd, setShowAdd] = useState(false)
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Student', dept: 'CSE' })

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

    const filtered = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search.toLowerCase())
        const matchRole = roleFilter === 'All' || u.role === roleFilter
        return matchSearch && matchRole
    })

    const toggleStatus = (id) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u))
        showToast('✅ User status updated')
    }

    const deleteUser = (id) => {
        setUsers(prev => prev.filter(u => u.id !== id))
        showToast('🗑️ User removed')
    }

    const addUser = () => {
        if (!newUser.name || !newUser.email) { showToast('⚠️ Fill all fields!'); return }
        setUsers(prev => [...prev, {
            ...newUser, id: Date.now(), status: 'Active',
            joined: 'Today', avatar: newUser.name[0].toUpperCase(),
        }])
        setShowAdd(false)
        setNewUser({ name: '', email: '', role: 'Student', dept: 'CSE' })
        showToast('✅ User added successfully!')
    }

    const roleCounts = allUsers.reduce((a, u) => ({ ...a, [u.role]: (a[u.role] || 0) + 1 }), {})

    return (
        <div className="page-wrapper">
            {toast && <div className="toast">{toast}</div>}
            <PageHeader title="User Management" subtitle="Manage All EduSphere Users" role="admin" back="/admin" />
            <div className="page-content" style={{ paddingBottom: 100 }}>

                {/* Role summary */}
                <div className="grid-3 animate-fadeInUp" style={{ marginBottom: 20 }}>
                    {['Admin', 'Staff', 'Student'].map(role => (
                        <div key={role} className="stat-card" style={{ borderTop: `3px solid ${roleColors[role]}`, textAlign: 'center', gap: 4 }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: roleColors[role] }}>{roleCounts[role] || 0}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{role}s</div>
                        </div>
                    ))}
                </div>

                {/* Search + filter + add */}
                <div className="animate-fadeInUp delay-1" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                            <input className="input-field" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
                        </div>
                        <button className="btn btn-gold btn-sm" onClick={() => setShowAdd(s => !s)}>
                            <Plus size={16} /> Add
                        </button>
                    </div>
                    <div className="tab-bar">
                        {['All', 'Admin', 'Staff', 'Student'].map(r => (
                            <button key={r} className={`tab-pill ${roleFilter === r ? 'active' : ''}`} onClick={() => setRoleFilter(r)}>{r}</button>
                        ))}
                    </div>
                </div>

                {/* Add user form */}
                {showAdd && (
                    <div className="animate-scaleIn glass-card" style={{ padding: 16, marginBottom: 16, border: '1px solid rgba(247,201,72,0.3)' }}>
                        <div className="section-title" style={{ marginBottom: 12 }}>Add New User</div>
                        <input className="input-field" placeholder="Full Name" value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} style={{ marginBottom: 8 }} />
                        <input className="input-field" placeholder="Email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} style={{ marginBottom: 8 }} />
                        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                            <select className="input-field" value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}>
                                <option>Student</option><option>Staff</option><option>Admin</option>
                            </select>
                            <select className="input-field" value={newUser.dept} onChange={e => setNewUser(p => ({ ...p, dept: e.target.value }))}>
                                <option>CSE</option><option>ECE</option><option>MECH</option><option>CIVIL</option><option>IT</option><option>Admin</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-gold btn-sm btn-full" onClick={addUser}><Plus size={14} /> Add User</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                {/* User list */}
                <div className="animate-fadeInUp delay-2 flex-col" style={{ gap: 10 }}>
                    {filtered.map(u => (
                        <div key={u.id} className="glass-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="avatar" style={{
                                background: roleBg[u.role], color: roleColors[u.role],
                                border: `2px solid ${roleColors[u.role]}44`,
                                width: 44, height: 44, borderRadius: 12,
                            }}>{u.avatar}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{u.name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>{u.email}</div>
                                <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                                    <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 100, background: roleBg[u.role], color: roleColors[u.role], fontWeight: 600 }}>{u.role}</span>
                                    <span style={{ fontSize: '0.65rem', color: statusColors[u.status], fontWeight: 600 }}>● {u.status}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                                    onClick={() => toggleStatus(u.id)}
                                >
                                    {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                    onClick={() => deleteUser(u.id)}
                                    style={{ background: 'none', border: 'none', color: 'var(--accent-pink)', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                            No users found
                        </div>
                    )}
                </div>
            </div>
            <BottomNav role="admin" items={navItems} />
            <Chatbot accentColor="var(--accent-gold)" />
        </div>
    )
}
