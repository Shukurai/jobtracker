'use client'

import { useState, useEffect } from 'react'
import { X, Trash2, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Application, ApplicationStatus, COLUMNS } from '@/types'
import { formatDate } from '@/lib/utils'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

interface Props {
    application: Application
    onClose: () => void
    onUpdated: () => void
    onDeleted: () => void
    onToast?: (message: string, type: 'success' | 'error') => void
    isPro: boolean
}

function isValidUrl(url: string): boolean {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}
export default function ApplicationDetailModal({ application, onClose, onUpdated, onDeleted, onToast, isPro }: Props) {
    const [company, setCompany] = useState(application.company)
    const [position, setPosition] = useState(application.position)
    const [url, setUrl] = useState(application.url ?? '')
    const [status, setStatus] = useState<ApplicationStatus>(application.status)
    const [notes, setNotes] = useState(application.notes ?? '')
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [appliedAt, setAppliedAt] = useState(
        application.applied_at ? application.applied_at.split('T')[0] : new Date().toISOString().split('T')[0]
    )
    const [urlError, setUrlError] = useState<string | null>(null)
    const [showConfirm, setShowConfirm] = useState(false)

    const [workType, setWorkType] = useState<'remote' | 'hybrid' | 'onsite' | null>(application.work_type ?? null)

    const [source, setSource] = useState<string>(application.source ?? '')

    const supabase = createClient()
    const [followUpDate, setFollowUpDate] = useState(application.follow_up_date ?? '')
    const [showOptional, setShowOptional] = useState(false)

    const [aiScore, setAiScore] = useState<{ score: number; points: string[] } | null>(
        application.ai_match_score ?? null
    )
    const [aiLoading, setAiLoading] = useState(false)
    const [aiError, setAiError] = useState<string | null>(null)
    const [jobDescription, setJobDescription] = useState(application.job_description ?? '')
    const [aiLanguage, setAiLanguage] = useState('English')

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase
            .from('applications')
            .update({
                company, position, url: url || null, status, notes: notes || null, applied_at: appliedAt || null, work_type: workType, source: source, follow_up_date: followUpDate || null, job_description: jobDescription || null,
            })
            .eq('id', application.id)
            
        if (error) setError(error.message)
        else { onToast?.('Application Saved', 'success'); onUpdated(); onClose() }

        setLoading(false)
    }
    async function handleAnalyzeMatch() {
        setAiLoading(true)
        setAiError(null)

        const res = await fetch('/api/analyze-match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId: application.id, language: aiLanguage })
        })

        const data = await res.json()
        if (!res.ok) {
            setAiError(data.error || 'Failed to analyze')
        } else {
            setAiScore(data)
            onUpdated()
        }
        setAiLoading(false)
    }
    async function handleDelete() {
        setDeleting(true)
        const { error } = await supabase
            .from('applications')
            .delete()
            .eq('id', application.id)
        if (error) { setError(error.message); setDeleting(false) }
        else { onToast?.('Application Deleted', 'success') ; onDeleted(); onClose() }
    }
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [onClose])
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-4 px-4">
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-surface border border-border rounded-2xl p-6 w-full max-w-md z-10 my-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-base font-semibold text-text">Edit application</h2>
                    <button onClick={onClose} className="text-muted hover:text-text transition-colors bg-transparent border-none cursor-pointer">
                        <X size={18} />
                    </button>
                </div>
                <p className="text-xs text-muted mb-6">Added {formatDate(application.created_at)}</p>

                <form onSubmit={handleSave} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-muted">Company *</label>
                        <input
                            value={company}
                            onChange={e => setCompany(e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-lg text-text text-sm outline-none focus:border-muted transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-muted">Position *</label>
                        <input
                            value={position}
                            onChange={e => setPosition(e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-lg text-text text-sm outline-none focus:border-muted transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
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
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-muted">Status</label>
                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value as ApplicationStatus)}
                            className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-lg text-text text-sm outline-none focus:border-muted transition-colors cursor-pointer"
                        >
                            {COLUMNS.map(col => (
                                <option key={col.id} value={col.id}>{col.label}</option>
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
                        <label className="text-xs text-muted">Follow-up date <span className="opacity-50">(optional)</span></label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={followUpDate}
                                onChange={e => setFollowUpDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="flex-1 px-3.5 py-2.5 bg-bg border border-border rounded-lg text-text text-sm outline-none focus:border-muted transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const d = new Date()
                                    d.setDate(d.getDate() + 1)
                                    setFollowUpDate(d.toISOString().split('T')[0])
                                }}
                                className="px-3 py-2 rounded-lg text-xs font-medium border border-border text-muted hover:border-muted hover:text-text transition-colors cursor-pointer bg-transparent whitespace-nowrap"
                            >
                                Tomorrow
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const d = new Date()
                                    d.setDate(d.getDate() + 7)
                                    setFollowUpDate(d.toISOString().split('T')[0])
                                }}
                                className="px-3 py-2 rounded-lg text-xs font-medium border border-border text-muted hover:border-muted hover:text-text transition-colors cursor-pointer bg-transparent whitespace-nowrap"
                            >
                                +1 week
                            </button>
                        </div>
                    </div> 
                    {/* Optional fields toggle */}
                    <button
                        type="button"
                        onClick={() => setShowOptional(!showOptional)}
                        className="flex items-center gap-2 text-xs text-muted hover:text-text transition-colors cursor-pointer bg-transparent border-none px-0 py-1"
                    >
                        <span>{showOptional ? '▲' : '▼'}</span>
                        <span>Optional fields</span>
                    </button>

                {showOptional && (
                    <div className="flex flex-col gap-4">
                    {/* TAGS */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-muted">Work type <span className="opacity-50">(optional)</span></label>
                        <div className="flex gap-2">
                            {(['remote', 'hybrid', 'onsite'] as const).map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setWorkType(workType === type ? null : type)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border
                    ${workType === type
                                            ? 'bg-text text-bg border-text'
                                            : 'bg-transparent text-muted border-border hover:border-muted hover:text-text'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div> 

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-muted">Source <span className="opacity-50">(optional)</span></label>
                        <div className="flex flex-wrap gap-2">
                            {['LinkedIn', 'Indeed', 'Company site', 'Referral', 'Other'].map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setSource(source === s ? '' : s)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border
                    ${source === s
                                            ? 'bg-text text-bg border-text'
                                            : 'bg-transparent text-muted border-border hover:border-muted hover:text-text'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-muted">Job description <span className="opacity-50">(optional, for AI match score)</span></label>
                        <textarea
                            value={jobDescription}
                            onChange={e => setJobDescription(e.target.value)}
                            placeholder="Paste job description here..."
                            rows={4}
                            className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-lg text-text text-sm outline-none focus:border-muted transition-colors resize-none"
                        />
                    </div>
                        {application.job_description ? (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-muted">AI Match Score</label>

                                {aiError && <p className="text-danger text-xs">{aiError}</p>}

                                {aiScore && (
                                    <div className="bg-bg border border-border rounded-lg p-3 mb-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-muted">Match score</span>
                                            <span className="text-2xl font-bold" style={{
                                                color: aiScore.score >= 70 ? '#22C55E' : aiScore.score >= 40 ? '#F59E0B' : '#EF4444'
                                            }}>
                                                {aiScore.score}%
                                            </span>
                                        </div>
                                        <ul className="flex flex-col gap-1.5">
                                            {aiScore.points.map((point, i) => (
                                                <li key={i} className="text-xs text-text leading-relaxed">• {point}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {isPro ? (
                                    
                                        <div className="flex gap-2">
                                            <select
                                                value={aiLanguage}
                                                onChange={e => setAiLanguage(e.target.value)}
                                                className="px-2 py-2.5 bg-bg border border-border rounded-lg text-text text-xs outline-none focus:border-muted transition-colors cursor-pointer"
                                            >
                                                <option value="English">EN</option>
                                                <option value="German">DE</option>
                                                <option value="Russian">RU</option>
                                                <option value="Spanish">ES</option>
                                                <option value="French">FR</option>
                                                <option value="Ukrainian">UA</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={handleAnalyzeMatch}
                                                disabled={aiLoading}
                                                className="flex-1 py-2.5 bg-transparent border border-border text-muted rounded-lg text-sm font-semibold hover:border-muted hover:text-text disabled:opacity-50 transition-colors cursor-pointer"
                                            >
                                                {aiLoading ? 'Analyzing...' : aiScore ? '✨ Re-analyze' : '✨ Analyze match'}
                                            </button>
                                        </div>
                                ) : (
                                    <div className="flex items-center justify-between py-2.5 px-3.5 bg-bg border border-border rounded-lg">
                                        <span className="text-xs text-muted">✨ AI Match Score is a Pro feature</span>
                                        <a href="/board" className="text-xs font-semibold text-text no-underline">
                                            Upgrade →
                                        </a>
                                    </div>
                                )}
                            </div>
                            ) : (<label className="text-xs text-accent bg-bg border-border border-dashed border-[1] p-2 text-center ">Save JOB DESCRIPTION to use AI Match Functions. DON'T FORGET to add your CV-text in "Settings"</label>)}            
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
                </div>
                )}

                    {error && <p className="text-danger text-xs">{error}</p>}

                    <div className="flex gap-3 mt-2">
                        <button
                            type="button"
                            onClick={() => setShowConfirm(true)}
                            disabled={deleting}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-transparent border border-border rounded-lg text-sm text-danger hover:border-danger transition-colors cursor-pointer disabled:opacity-50"
                        >
                            <Trash2 size={14} />
                            {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-text hover:bg-accent-hover disabled:opacity-50 text-bg rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
            {showConfirm && (
                <ConfirmDialog
                    message="Delete this application? This action cannot be undone."
                    onConfirm={handleDelete}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </div>
    )
}