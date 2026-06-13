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
import ConfirmDialog from '@/components/ui/ConfirmDialog'

export default function BoardPage() {
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [selected, setSelected] = useState<Application | null>(null)
    const supabase = createClient()
    const [search, setSearch] = useState('')
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
    const [defaultStatus, setDefaultStatus] = useState<ApplicationStatus>('applied')
    const [isPro, setIsPro] = useState(false)
    const isAtLimit = applications.length >= 15

    const [selectionMode, setSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)

    function toggleSelect(id: string) {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    async function handleBulkDelete() {
        await supabase.from('applications').delete().in('id', [...selectedIds])
        setSelectedIds(new Set())
        setSelectionMode(false)
        setShowBulkDeleteConfirm(false)
        fetchApplications()
    }


    async function fetchApplications() {
        const { data } = await supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false })
        setApplications(data ?? [])
        setLoading(false)
        window.dispatchEvent(new Event('applications-changed'))
    }
    //если выбраны то по ESC отменяем
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape' && selectionMode) {
                setSelectionMode(false)
                setSelectedIds(new Set())
            }
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [selectionMode])

    useEffect(() => { fetchApplications() }, [])
    useEffect(() => {
        async function fetchProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data } = await supabase
                .from('profiles')
                .select('is_pro')
                .eq('id', user.id)
                .maybeSingle()
            setIsPro(data?.is_pro ?? false)
        }
        fetchProfile()
    }, [])

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

                <button
                    onClick={() => { setSelectionMode(!selectionMode); setSelectedIds(new Set()) }}
                    className="px-4 py-2 bg-surface border border-border text-muted rounded-lg text-sm font-semibold hover:text-text transition-colors cursor-pointer flex-shrink-0"
                >
                    {selectionMode ? 'Cancel' : 'Select'}
                </button>

                {isAtLimit && !isPro ? (
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <p className="hidden md:block text-xs text-warning">Free limit reached (15/15)</p>
                        <UpgradeButton className="text-xs px-3 py-1.5 md:px-4 md:py-2" />
                    </div>
                ) : (
                    <button
                        onClick={() => setShowAdd(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-text text-bg rounded-lg text-sm font-semibold hover:bg-accent-hover transition-colors cursor-pointer flex-shrink-0"
                    >
                        <Plus size={15} />
                        <span className="hidden md:inline">Add</span>
                    </button>
                )}
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
                <>
                    {selectionMode && selectedIds.size > 0 && (
                        <div className="flex items-center justify-between mb-4 px-4 py-2 bg-surface border border-border rounded-lg">
                            <span className="text-sm text-text">{selectedIds.size} selected</span>
                                <button
                                    onClick={() => setShowBulkDeleteConfirm(true)}
                                    className="px-3 py-1.5 bg-danger text-white rounded-lg text-xs font-semibold hover:opacity-90 cursor-pointer"
                                >
                                    Delete selected
                                </button>
                        </div>
                    )}
                    <KanbanBoard
                        applications={filtered}
                        onSelect={setSelected}
                        onUpdate={fetchApplications}
                        onOptimisticUpdate={setApplications}
                        onAdd={(status) => {
                            setDefaultStatus(status)
                            setShowAdd(true)
                        }}
                        selectionMode={selectionMode}
                        selectedIds={selectedIds}
                        onToggleSelect={toggleSelect}
                    />
                </>
            )}
            {showBulkDeleteConfirm && (
                <ConfirmDialog
                    message={`Delete ${selectedIds.size} application${selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.`}
                    onConfirm={handleBulkDelete}
                    onCancel={() => setShowBulkDeleteConfirm(false)}
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
                    isPro={isPro}
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