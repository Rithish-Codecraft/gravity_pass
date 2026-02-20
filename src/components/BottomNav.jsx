import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function BottomNav({ role, items }) {
    const navigate = useNavigate()
    const location = useLocation()

    const accentColors = {
        staff: 'var(--staff-primary)',
        student: 'var(--student-primary)',
        admin: 'var(--admin-primary)',
    }
    const accent = accentColors[role] || 'var(--accent-purple)'

    return (
        <nav className="bottom-nav" style={{ '--role-accent': accent }}>
            {items.map((item) => {
                const isActive = location.pathname === item.path ||
                    (item.path !== `/${role}` && location.pathname.startsWith(item.path))
                return (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                        style={{ color: isActive ? accent : undefined }}
                    >
                        <item.icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                        <span>{item.label}</span>
                        {isActive && <div className="nav-dot" />}
                    </button>
                )
            })}
        </nav>
    )
}
