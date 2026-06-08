'use client'

import { Application, COLUMNS } from '@/types'
import { Download } from 'lucide-react'

export default function ExportButton({ applications }: { applications: Application[] }) {
    function handleExport() {
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
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n')

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `jobtracker-export-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 bg-transparent border border-border rounded-lg text-sm text-muted hover:text-text hover:border-muted transition-colors cursor-pointer"
        >
            <Download size={14} />
            <span className="hidden md:inline">Export CSV</span>
        </button>
    )
}