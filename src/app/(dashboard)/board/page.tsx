'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Application, ApplicationStatus } from '@/types'
import AddApplicationModal from '@/components/board/AddApplicationModal'
import ApplicationDetailModal from '@/components/board/ApplicationDetailModal'
import KanbanBoard from '@/components/board/KanbanBoard'
import { Plus } from 'lucide-react'
import Toast from '@/components/ui/Toast'
import UpgradeButton from '@/components/ui/UpgradeButton'

export default function BoardPage() {
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [selected, setSelected] = useState<Application | null>(null)
    const supabase = createClient()
    const [search, setSearch] = useState('')
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
    const [defaultStatus, setDefaultStatus] = useState<ApplicationStatus>('applied')

    const isAtLimit = applications.length >= 15


    async function fetchApplications() {
        const { data } = await supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false })
        setApplications(data ?? [])
        setLoading(false)
    }

    useEffect(() => { fetchApplications() }, [])

    const filtered = applications.filter(a =>
        a.company.toLowerCase().includes(search.toLowerCase()) ||
        a.position.toLowerCase().includes(search.toLowerCase())
    )
    return (
        <div>
            <div className="flex items-center justify-between mb-8 gap-4">
                <div className="flex-shrink-0 min-w-0">
                    <h1 className="text-xl font-bold text-text">Board</h1>
                    <p className="text-xs text-muted mt-0.5">{applications.length} applications</p>
                </div>

                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="flex-1 min-w-0 px-3.5 py-2 bg-surface border border-border rounded-lg text-text text-sm outline-none focus:border-muted transition-colors"
                />

                {isAtLimit && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-surface border border-warning/30 rounded-lg">
                        <p className="text-xs text-warning">Free limit reached (15/15)</p>
                        <UpgradeButton />
                    </div>
                )}
                <button
                    onClick={() => setShowAdd(true)}
                    disabled={isAtLimit}
                    className="flex items-center gap-2 px-4 py-2 bg-text text-bg rounded-lg text-sm font-semibold hover:bg-accent-hover transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                >
                    <Plus size={15} />
                    Add
                </button>
            </div>
        

            {loading ? (
                <div className="flex items-center justify-center mt-32">
                    <div className="loader" />
                </div>
            ) : applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center mt-32 gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center text-2xl">
                            <img src="/icon.png" alt="JobTracker" className="w-10 h-10 object-contain" />
                    </div>
                    <div className="text-center">
                        <p className="text-text font-semibold text-sm">No applications yet</p>
                        <p className="text-muted text-xs mt-1">Add your first job application to get started</p>
                    </div>
                    <button
                        onClick={() => setShowAdd(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-text text-bg rounded-lg text-sm font-semibold hover:bg-accent-hover transition-colors cursor-pointer mt-2"
                    >
                        <Plus size={15} />
                        Add application
                    </button>
                </div>
            ) : (
                <KanbanBoard
                    applications={filtered}
                    onSelect={setSelected}
                    onUpdate={fetchApplications}
                    onOptimisticUpdate={setApplications}
                    onAdd={(status) => {
                        setDefaultStatus(status)
                        setShowAdd(true)
                    }}
                />
            )}

            {showAdd && (
                <AddApplicationModal
                    onClose={() => setShowAdd(false)}
                    onAdded={fetchApplications}
                    onToast={(message, type) => setToast({ message, type })}
                    defaultStatus={defaultStatus}
                />
            )}

            {selected && (
                <ApplicationDetailModal
                    application={selected}
                    onClose={() => setSelected(null)}
                    onUpdated={fetchApplications}
                    onDeleted={fetchApplications}
                    onToast={(message, type) => setToast({ message, type })}
                />
            )}

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    )
}