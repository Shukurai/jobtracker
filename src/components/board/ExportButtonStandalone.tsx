'use client'

import { createClient } from '@/lib/supabase/client'
import { COLUMNS } from '@/types'
import { Download } from 'lucide-react'
import { useState } from 'react'

export default function ExportButtonStandalone() {
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    async function handleExport() {
        setLoading(true)
        const { data: applications } = await supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false })

        if (!applications) { setLoading(false); return }

        const headers = ['Company', 'Position', 'Status', 'Applied At', 'URL', 'Notes']
        const rows = applications.map(app => [
            app.company,
            app.position,
            COLUMNS.find(c => c.id === app.status)?.label ?? app.status,
            app.applied_at ?? '',
            app.url ?? '',
            app.notes ?? '',
        ])

        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
            .join('\n')

        const BOM = '\uFEFF'
        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `jobtracker-export-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
        setLoading(false)
    }

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:bg-surface-hover hover:text-text transition-all w-full bg-transparent border-none cursor-pointer disabled:opacity-50"
        >
            <Download size={16} />
            {loading ? 'Exporting...' : 'Export CSV'}
        </button>
    )
}