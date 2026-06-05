'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Application, COLUMNS } from '@/types'

interface Stat {
    label: string
    value: number | string
    sub?: string
}

export default function StatsPage() {
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    

    useEffect(() => {
        async function fetch() {
            const { data } = await supabase
                .from('applications')
                .select('*')
                .order('created_at', { ascending: true })
            setApplications(data ?? [])
            setLoading(false)
        }
        fetch()
    }, [])



    if (loading) return <p className="text-muted text-sm">Loading...</p>

    const total = applications.length
    const offers = applications.filter(a => a.status === 'offer').length
    const rejected = applications.filter(a => a.status === 'rejected').length
    const active = applications.filter(a => !['offer', 'rejected'].includes(a.status)).length
    const responseRate = total > 0
        ? Math.round((applications.filter(a => a.status !== 'wishlist' && a.status !== 'applied').length / total) * 100)
        : 0

    const stats = [
        { label: 'Total', value: total, sub: 'applications', color: '#f0f0f0' },
        { label: 'Active', value: active, sub: 'in progress', color: '#22C55E' },
        { label: 'Offers', value: offers, sub: 'received', color: '#3B82F6' },
        { label: 'Rejected', value: rejected, sub: 'closed', color: '#EF4444' },
        { label: 'Response rate', value: `${responseRate}%`, sub: 'got to interview+', color: '#F59E0B' },
    ]


    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-xl font-bold text-text">Stats</h1>
                <p className="text-xs text-muted mt-0.5">Overview of your job search</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8 max-w-1xl">
                {stats.map(stat => (
                    <div
                        key={stat.label}
                        className="bg-surface border border-border rounded-xl p-5"
                        style={{ borderLeft: `3px solid ${stat.color}` }}
                    >
                        <p className="text-xs text-muted uppercase tracking-wider mb-3">{stat.label}</p>
                        <p className="text-4xl font-bold leading-none" style={{ color: stat.color }}>
                            {stat.value}
                        </p>
                        {stat.sub && <p className="text-xs text-muted mt-2">{stat.sub}</p>}
                    </div>
                ))}
            </div>

            {/* By status */}
            <div className="max-w-xs">
                <h2 className="text-sm font-semibold text-text mb-3">By status</h2>
                <div className="bg-surface border border-border rounded-xl overflow-hidden">
                    {COLUMNS.map((col, i) => {
                        const count = applications.filter(a => a.status === col.id).length
                        const pct = total > 0 ? (count / total) * 100 : 0
                        return (
                            <div
                                key={col.id}
                                className={`flex items-center gap-4 px-5 py-3.5 ${i !== COLUMNS.length - 1 ? 'border-b border-border' : ''}`}
                            >
                                <span
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ background: col.color }}
                                />
                                <span className="text-sm text-text flex-1">{col.label}</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-1.5 bg-bg rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{ width: `${pct}%`, background: col.color }}
                                        />
                                    </div>
                                    <span className="text-sm text-muted w-4 text-right">{count}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}