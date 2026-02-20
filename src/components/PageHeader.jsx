import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut } from 'lucide-react'
import { logout } from '../api/auth'

export default function PageHeader({ title, subtitle, back, role, rightAction }) {
    const navigate = useNavigate()

    return (
        <header className="page-header">
            <div className="flex-row" style={{ gap: 12 }}>
                {back && (
                    <button
                        onClick={() => navigate(back)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}
                    >
                        <ArrowLeft size={22} />
                    </button>
                )}
                <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                        {title}
                    </div>
                    {subtitle && <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 1 }}>{subtitle}</div>}
                </div>
            </div>
            <div className="flex-row" style={{ gap: 8 }}>
                {rightAction}
                <button
                    onClick={logout}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    )
}
