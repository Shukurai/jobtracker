'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ApplicationStatus, COLUMNS } from '@/types'

interface Props {
    onClose: () => void
    onAdded: () => void
    onToast?: (message: string, type: 'success' | 'error') => void
    defaultStatus?: ApplicationStatus
}
function isValidUrl(url: string): boolean {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

export default function AddApplicationModal({ onClose, onAdded, onToast, defaultStatus }: Props) {
    const [company, setCompany] = useState('')
    const [position, setPosition] = useState('')
    const [url, setUrl] = useState('')
    const [status, setStatus] = useState<ApplicationStatus>(defaultStatus ?? 'applied')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [appliedAt, setAppliedAt] = useState(new Date().toISOString().split('T')[0])
    const supabase = createClient()
    const [urlError, setUrlError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setError('Not authenticated'); setLoading(false); return }


        if (url && !isValidUrl(url)) {
            setUrlError('Invalid URL')
            setLoading(false)
            return
        }    

        const { error } = await supabase.from('applications').insert({
            user_id: user.id,
            company,
            position,
            url: url || null,
            status,
            notes: notes || null,
            applied_at: appliedAt || null,
        })

        if (error) setError(error.message)
        else {
            onToast?.('Application added', 'success')
            onAdded()
            onClose()
        }

        setLoading(false)
    }

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [onClose])
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-surface border border-border rounded-2xl p-6 w-full max-w-md z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-semibold text-text">Add application</h2>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-text transition-colors bg-transparent border-none cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-muted">Company *</label>
                        <input
                            value={company}
                            onChange={e => setCompany(e.target.value)}
                            required
                            placeholder="Google"
                            className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-lg text-text text-sm outline-none focus:border-muted transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-muted">Position *</label>
                        <input
                            value={position}
                            onChange={e => setPosition(e.target.value)}
                            required
                            placeholder="Frontend Developer"
                            className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-lg text-text text-sm outline-none focus:border-muted transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-muted">Job URL</label>
                        <input
                            value={url}
                            onChange={e => {
                                setUrl(e.target.value)
                                if (e.target.value && !isValidUrl(e.target.value)) {
                                    setUrlError('Invalid URL — must start with https://')
                                } else {
                                    setUrlError(null)
                                }
                            }}
                            placeholder="https://..."
                            className={`w-full px-3.5 py-2.5 bg-bg border rounded-lg text-text text-sm outline-none transition-colors
      ${urlError ? 'border-danger' : 'border-border focus:border-muted'}`}
                        />
                        {urlError && <p className="text-danger text-xs">{urlError}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-muted">Status</label>
                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value as ApplicationStatus)}
                            className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-lg text-sm outline-none focus:border-muted transition-colors cursor-pointer"
                            style={{ color: COLUMNS.find(c => c.id === status)?.color }}
                        >
                            {COLUMNS.map(col => (
                                <option key={col.id} value={col.id} style={{ color: col.color }}>
                                    {col.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-muted">
                            Applied at{' '}
                            {appliedAt === new Date().toISOString().split('T')[0] && (
                                <span className="text-muted">(today)</span>
                            )}
                        </label><input
                            type="date"
                            value={appliedAt}
                            onChange={e => setAppliedAt(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-lg text-text text-sm outline-none focus:border-muted transition-colors"
                        />
                    </div>        
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-muted">Notes</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Any notes..."
                            rows={3}
                            className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-lg text-text text-sm outline-none focus:border-muted transition-colors resize-none"
                        />
                    </div>

                    {error && <p className="text-danger text-xs">{error}</p>}

                    <div className="flex gap-3 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-transparent border border-border rounded-lg text-sm text-muted hover:text-text hover:border-muted transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-text hover:bg-accent-hover disabled:opacity-50 text-bg rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                        >
                            {loading ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}