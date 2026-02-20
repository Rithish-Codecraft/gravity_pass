import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function DashboardCard({ title, value, icon: Icon, color, trend, trendValue, subtitle }) {
    return (
        <div className="glass-card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1, transform: 'rotate(15deg)' }}>
                {Icon && <Icon size={80} color={color} />}
            </div>

            <div className="flex-row" style={{ marginBottom: 12 }}>
                <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${color}40`
                }}>
                    {Icon && <Icon size={22} color={color} />}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>
                    {title}
                </div>
            </div>

            <div style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 8 }}>
                {value}
            </div>

            {(trend || subtitle) && (
                <div className="flex-row" style={{ gap: 8 }}>
                    {trend && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            fontSize: '0.78rem', fontWeight: 600,
                            color: trend === 'up' ? 'var(--accent-teal)' : trend === 'down' ? 'var(--accent-pink)' : 'var(--text-secondary)',
                            background: trend === 'up' ? 'rgba(0,212,170,0.1)' : trend === 'down' ? 'rgba(255,107,157,0.1)' : 'rgba(255,255,255,0.05)',
                            padding: '4px 8px', borderRadius: 100
                        }}>
                            {trend === 'up' ? <TrendingUp size={14} /> : trend === 'down' ? <TrendingDown size={14} /> : <Minus size={14} />}
                            {trendValue}
                        </div>
                    )}
                    {subtitle && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{subtitle}</div>}
                </div>
            )}
        </div>
    )
}
