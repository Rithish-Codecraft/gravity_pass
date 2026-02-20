import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function QuickActions({ actions }) {
    const navigate = useNavigate()

    return (
        <div className="grid-2" style={{ gap: 14 }}>
            {actions.map((action) => (
                <button
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    className="glass-card"
                    style={{
                        padding: 18,
                        display: 'flex', alignItems: 'center', gap: 14,
                        cursor: 'pointer', textAlign: 'left',
                        position: 'relative', overflow: 'hidden'
                    }}
                >
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: `${action.color}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: action.color, flexShrink: 0
                    }}>
                        <action.icon size={20} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{action.label}</div>
                        {action.desc && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{action.desc}</div>}
                    </div>
                </button>
            ))}
        </div>
    )
}
