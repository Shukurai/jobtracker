'use client'

import { useState,useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import UpgradeButton from '@/components/ui/UpgradeButton'

export default function SettingsPage() {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loadingPassword, setLoadingPassword] = useState(false)
    const [loadingDelete, setLoadingDelete] = useState(false)
    const [passwordMsg, setPasswordMsg] = useState<{ text: string; ok: boolean } | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const [showClearConfirm, setShowClearConfirm] = useState(false)
    const [loadingClear, setLoadingClear] = useState(false)


    const supabase = createClient()
    const router = useRouter()

    const [isPro, setIsPro] = useState(false)
    const [loadingSubscription, setLoadingSubscription] = useState(false)

    const [resumeText, setResumeText] = useState('')
    const [savingResume, setSavingResume] = useState(false)
    const [resumeMsg, setResumeMsg] = useState<{ text: string; ok: boolean } | null>(null)
    
    
    
    //загрузка для расширения
    useEffect(() => {
        async function loadResume() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data } = await supabase
                .from('profiles')
                .select('resume_text')
                .eq('id', user.id)
                .single()
            if (data?.resume_text) setResumeText(data.resume_text)
        }
        loadResume()
    }, [supabase])

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data } = await supabase.from('profiles').select('is_pro').eq('id', user.id).single()
            setIsPro(data?.is_pro ?? false)
        }
        loadProfile()
    }, [supabase])

    async function handleSaveResume(e: React.FormEvent) {
        e.preventDefault()
        setSavingResume(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('profiles')
            .update({ resume_text: resumeText || null })
            .eq('id', user.id)

        if (error) setResumeMsg({ text: error.message, ok: false })
        else setResumeMsg({ text: 'Resume saved', ok: true })
        setSavingResume(false)
    }

    async function handleClearApplications() {
        setLoadingClear(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        await supabase.from('applications').delete().eq('user_id', user.id)
        setShowClearConfirm(false)
        setLoadingClear(false)
        window.dispatchEvent(new Event('applications-changed'))
    }

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            setPasswordMsg({ text: 'Passwords do not match', ok: false })
            return
        }
        setLoadingPassword(true)
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) setPasswordMsg({ text: error.message, ok: false })
        else setPasswordMsg({ text: 'Password updated successfully', ok: true })
        setLoadingPassword(false)
    }

    async function handleDeleteAccount() {
        setLoadingDelete(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase.from('applications').delete().eq('user_id', user.id)
        await supabase.auth.signOut()
        router.push('/')
        setLoadingDelete(false)
    }

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-xl font-bold text-text">Settings</h1>
                <p className="text-xs text-muted mt-0.5">Manage your account</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Change password */}
                <div className="bg-surface border border-border rounded-2xl p-6">
                    <h2 className="text-sm font-semibold text-text mb-4">Change password</h2>
                    <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-muted">New password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-lg text-text text-sm outline-none focus:border-muted transition-colors"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-muted">Confirm password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-lg text-text text-sm outline-none focus:border-muted transition-colors"
                            />
                        </div>
                        {passwordMsg && (
                            <p className={`text-xs ${passwordMsg.ok ? 'text-success' : 'text-danger'}`}>
                                {passwordMsg.text}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={loadingPassword}
                            className="py-2.5 bg-text text-bg rounded-lg text-sm font-semibold hover:bg-accent-hover disabled:opacity-50 transition-colors cursor-pointer"
                        >
                            {loadingPassword ? 'Updating...' : 'Update password'}
                        </button>
                    </form>
                </div>

                {/* Resume for AI Match */}
                <div className="bg-surface border border-border rounded-2xl p-6">
                    <h2 className="text-sm font-semibold text-text mb-2">Resume</h2>
                    <p className="text-xs text-muted mb-4 leading-relaxed">
                        Paste your resume text to get an AI-powered match score against job descriptions.
                    </p>
                    <form onSubmit={handleSaveResume} className="flex flex-col gap-3">
                        <textarea
                            value={resumeText}
                            onChange={e => setResumeText(e.target.value)}
                            placeholder="Paste your resume text here..."
                            rows={6}
                            className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-lg text-text text-sm outline-none focus:border-muted transition-colors resize-none"
                        />
                        {resumeMsg && (
                            <p className={`text-xs ${resumeMsg.ok ? 'text-success' : 'text-danger'}`}>
                                {resumeMsg.text}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={savingResume}
                            className="py-2.5 bg-text text-bg rounded-lg text-sm font-semibold hover:bg-accent-hover disabled:opacity-50 transition-colors cursor-pointer"
                        >
                            {savingResume ? 'Saving...' : 'Save resume'}
                        </button>
                    </form>
                </div>

                {/* Subscription */}
                <div className="bg-surface border border-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-sm font-semibold text-text">Subscription</h2>
                        {isPro && (
                            <span className="text-xs font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-md">
                                PRO
                            </span>
                        )}
                    </div>
                    {isPro ? (
                        <>
                            <p className="text-xs text-muted mb-4 leading-relaxed">
                                You're on the Pro plan — unlimited applications and all features unlocked.
                            </p>
                            <a
                            href="https://app.lemonsqueezy.com/my-orders"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block py-2.5 px-4 bg-transparent border border-border text-muted rounded-lg text-sm font-semibold hover:border-muted hover:text-text transition-colors cursor-pointer no-underline"
                        >
                            Manage subscription ↗
                        </a>
                </>
                ) : (
                <>
                    <p className="text-xs text-muted mb-4 leading-relaxed">
                        You're on the Free plan — up to 15 applications.
                    </p>
                    <UpgradeButton className="inline-block" />
            </>
                )}
        </div>

            {/* Delete all applications */ }
    <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-text mb-2">Clear all applications</h2>
        <p className="text-xs text-muted mb-4 leading-relaxed">
            Delete all your job applications but keep your account. This action cannot be undone.
        </p>
        {!showClearConfirm ? (
            <button
                onClick={() => setShowClearConfirm(true)}
                className="py-2.5 px-4 bg-transparent border border-border text-muted rounded-lg text-sm font-semibold hover:border-muted hover:text-text transition-colors cursor-pointer"
            >
                Clear all applications
            </button>
        ) : (
            <div className="flex flex-col gap-3">
                <p className="text-xs text-warning font-semibold">Are you sure? All applications will be deleted.</p>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowClearConfirm(false)}
                        className="flex-1 py-2.5 bg-transparent border border-border rounded-lg text-sm text-muted hover:text-text transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleClearApplications}
                        disabled={loadingClear}
                        className="flex-1 py-2.5 bg-warning text-bg rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                        {loadingClear ? 'Deleting...' : 'Yes, clear all'}
                    </button>
                </div>
            </div>
        )}
    </div>

        </div >

        {/* Delete account */ }
        < div className = "bg-surface border border-danger/30 rounded-2xl p-6 mt-4" >
            <h2 className="text-sm font-semibold text-danger mb-2">Danger zone</h2>
            <p className="text-xs text-muted mb-4 leading-relaxed">
                Permanently delete your account and all your job applications. This action cannot be undone.
            </p>
    {
        !showDeleteConfirm ? (
            <button
                onClick={() => setShowDeleteConfirm(true)}
                className="py-2.5 px-4 bg-transparent border border-danger/50 text-danger rounded-lg text-sm font-semibold hover:bg-danger/10 transition-colors cursor-pointer"
            >
                Delete account
            </button>
        ) : (
        <div className="flex flex-col gap-3">
            <p className="text-xs text-danger font-semibold">Are you sure? This cannot be undone.</p>
            <div className="flex gap-3">
                <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2.5 bg-transparent border border-border rounded-lg text-sm text-muted hover:text-text transition-colors cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    onClick={handleDeleteAccount}
                    disabled={loadingDelete}
                    className="flex-1 py-2.5 bg-danger text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-colors cursor-pointer"
                >
                    {loadingDelete ? 'Deleting...' : 'Yes, delete'}
                </button>
            </div>
        </div>
    )
    }
        </div >

    </div >
)
}