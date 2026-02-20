import React from 'react'
import { ResponsiveContainer } from 'recharts'

export default function ChartSection({ title, children, height = 250, action }) {
    return (
        <div className="glass-card" style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="flex-between" style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700 }}>
                    {title}
                </div>
                {action}
            </div>

            <div style={{ flex: 1, minHeight: height, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    {children}
                </ResponsiveContainer>
            </div>
        </div>
    )
}
