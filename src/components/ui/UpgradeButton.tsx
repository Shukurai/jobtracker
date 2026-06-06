'use client'

import { useState } from 'react'

export default function UpgradeButton({ className }: { className?: string }) {
    const [loading, setLoading] = useState(false)

    async function handleUpgrade() {
        setLoading(true)
        const res = await fetch('/api/checkout', { method: 'POST' })
        const { url } = await res.json()
        if (url) window.location.href = url
        setLoading(false)
    }

    return (
        <button
            onClick={handleUpgrade}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 bg-warning text-bg rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-colors cursor-pointer border-none ${className}`}
        >
            {loading ? 'Loading...' : '⚡ Upgrade to Pro'}
        </button>
    )
}