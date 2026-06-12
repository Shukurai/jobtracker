'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Application, COLUMNS } from '@/types'
import ActivityChart from '@/components/stats/ActivityChart'

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



    if (loading) return (
        <div className="flex items-center justify-center mt-32">
            <div className="loader" />
        </div>
    )

    const total = applications.length
    const offers = applications.filter(a => a.status === 'offer').length
    const rejected = applications.filter(a => a.status === 'rejected').length
    const active = applications.filter(a => !['offer', 'rejected'].includes(a.status)).length
    const responseRate = total > 0
        ? Math.round((applications.filter(a => a.status !== 'wishlist' && a.status !== 'applied').length / total) * 100)
        : 0

    const stats = [
        { label: 'Total', value: total, sub: 'applications', color: 'var(--color-text)' },
        { label: 'Active', value: active, sub: 'in progress', color: '#22C55E' },
        { label: 'Offers', value: offers, sub: 'received', color: '#3B82F6' },
        { label: 'Rejected', value: rejected, sub: 'closed', color: '#EF4444' },
        { label: 'Response rate', value: `${responseRate}%`, sub: 'got to interview+', color: '#F59E0B' },
    ]

    // Считаем активность по неделям (последние 8 недель)
    const weeklyActivity = Array.from({ length: 8 }, (_, i) => {
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - (7 * (7 - i)))
        weekStart.setHours(0, 0, 0, 0)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 7)

        const count = applications.filter(a => {
            const date = new Date(a.applied_at ?? a.created_at)
            return date >= weekStart && date < weekEnd
        }).length

        const label = weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        return { label, count }
    })

    const maxWeekly = Math.max(...weeklyActivity.map(w => w.count), 1)

    // Среднее время от applied до других статусов
    const avgDays = (targetStatus: string) => {
        const apps = applications.filter(a =>
            a.status === targetStatus && a.applied_at
        )
        if (apps.length === 0) return null
        const total = apps.reduce((sum, a) => {
            const applied = new Date(a.applied_at!)
            const updated = new Date(a.updated_at)
            return sum + Math.floor((updated.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24))
        }, 0)
        return Math.round(total / apps.length)
    }

    const avgToInterview = avgDays('interview')
    const avgToOffer = avgDays('offer')
    const avgToRejected = avgDays('rejected')

    // Топ источников
    const sourceCounts = applications
        .filter(a => a.source)
        .reduce((acc, a) => {
            acc[a.source!] = (acc[a.source!] ?? 0) + 1
            return acc
        }, {} as Record<string, number>)

    const topSources = Object.entries(sourceCounts)
        .sort((a, b) => b[1] - a[1])

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-xl font-bold text-text">Stats</h1>
                <p className="text-xs text-muted mt-0.5">Overview of your job search</p>
            </div>

            <div className="">
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


                
                
                <div className="flex gap-6 flex-col lg:flex-row">

                    {/* Левая колонка */}
                    <div className="flex-1 flex flex-col gap-6">

                        {/* Воронка конверсии */}
                        <div className="bg-surface border border-border rounded-2xl p-6">
                            <h2 className="text-sm font-semibold text-text mb-4">Conversion funnel</h2>
                            {COLUMNS.filter(col => col.id !== 'wishlist').map((col, i, arr) => {
                                const count = applications.filter(a => a.status === col.id).length
                                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                                return (
                                    <div key={col.id} className={`py-3 ${i !== arr.length - 1 ? 'border-b border-border' : ''}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.color }} />
                                                <span className="text-sm text-text">{col.label}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-muted">{pct}%</span>
                                                <span className="text-sm font-semibold text-text w-6 text-right">{count}</span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{ width: `${Math.max(pct, 5)}%`, background: col.color }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        {/* Среднее время */}
                        <div className="bg-surface border border-border rounded-2xl p-6">
                            <h2 className="text-sm font-semibold text-text mb-4">Average time to status</h2>
                            <div className="flex flex-col gap-3">
                                {[
                                    { label: 'To Interview', value: avgToInterview, color: '#3B82F6' },
                                    { label: 'To Offer', value: avgToOffer, color: '#22C55E' },
                                    { label: 'To Rejection', value: avgToRejected, color: '#EF4444' },
                                ].map(item => (
                                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                                            <span className="text-sm text-text">{item.label}</span>
                                        </div>
                                        <span className="text-2xl font-bold" style={{ color: item.color }}>
                                            {item.value !== null ? `${item.value}d` : '—'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                            
                    </div>

                    {/* Правая колонка */}
                    <div className="flex-1 flex flex-col gap-6">

                        
                        {/* Топ источников */}
                        <div className="bg-surface border border-border rounded-2xl p-6">
                            <h2 className="text-sm font-semibold text-text mb-4">Top sources</h2>
                            {topSources.length === 0 ? (
                                <p className="text-xs text-muted">No source data yet</p>
                            ) : (
                                <div className="flex flex-col">
                                    {topSources.map(([source, count], i) => {
                                        const pct = total > 0 ? Math.round((count / total) * 100) : 0
                                        return (
                                            <div key={source} className={`flex items-center gap-4 py-3 ${i !== topSources.length - 1 ? 'border-b border-border' : ''}`}>
                                                <span className="text-sm text-text flex-1">{source}</span>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-20 h-1.5 bg-bg rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all bg-text"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-muted">{pct}%</span>
                                                    <span className="text-sm font-semibold text-text w-4 text-right">{count}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* График активности */}
                        <div className="bg-surface border border-border rounded-2xl p-6">
                            <h2 className="text-sm font-semibold text-text mb-4">Weekly activity</h2>
                            <ActivityChart data={weeklyActivity} />
                        </div>

                    </div>

                </div>

            </div>
        </div>
    )
}