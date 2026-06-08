'use client'

import { useState } from 'react'

const TEST_MODE = true // поменяй на false когда верификация пройдёт

export default function UpgradeButton({ className }: { className?: string }) {
    const [loading, setLoading] = useState(false)

    async function handleUpgrade() {
        if (TEST_MODE) return
        setLoading(true)
        const res = await fetch('/api/checkout', { method: 'POST' })
        const { url } = await res.json()
        if (url) window.location.href = url
        setLoading(false)
    }

    return (
        <button
            onClick={handleUpgrade}
            disabled={loading || TEST_MODE}
            title={TEST_MODE ? 'Coming soon' : undefined}
            className={`flex items-center gap-2 px-4 py-2 bg-warning text-bg rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer border-none ${className}`}
        >
            {TEST_MODE ? '⚡ Coming soon' : loading ? 'Loading...' : '⚡ Upgrade to Pro'}
        </button>
    )
}