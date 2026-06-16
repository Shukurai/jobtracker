'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [ready, setReady] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // Supabase обрабатывает токен из URL автоматически при наличии сессии восстановления
        supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setReady(true)
            }
        })
        // На случай если сессия уже установлена при загрузке
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) setReady(true)
        })
    }, [supabase])

    function validatePassword(pwd: string): string | null {
        if (pwd.length < 8) return 'Password must be at least 8 characters'
        if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter'
        if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number'
        return null
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        const passwordError = validatePassword(password)
        if (passwordError) {
            setError(passwordError)
            return
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)
        const { error } = await supabase.auth.updateUser({ password })
        if (error) setError(error.message)
        else setSuccess(true)
        setLoading(false)
    }

    if (success) {
        return (
            <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-10 text-center">
                <h2 className="text-base font-semibold text-text mb-2">Password updated</h2>
                <p className="text-xs text-muted mb-8 leading-relaxed">
                    Your password has been changed successfully.
                </p>
                <button
                    onClick={() => router.push('/login')}
                    className="w-full py-2.5 bg-text text-bg rounded-lg text-sm font-semibold cursor-pointer hover:bg-accent-hover transition-colors border-none"
                >
                    Go to sign in
                </button>
            </div>
        )
    }

    if (!ready) {
        return (
            <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-10 text-center">
                <p className="text-xs text-muted">Verifying reset link...</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-10">
            <div className="flex flex-col items-center mb-8">
                <h1 className="text-xl font-bold text-text">Set new password</h1>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-muted">New password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
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

                {error && <p className="text-danger text-xs">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-text hover:bg-accent-hover disabled:opacity-50 text-bg rounded-lg text-sm font-semibold cursor-pointer transition-colors"
                >
                    {loading ? 'Updating...' : 'Update password'}
                </button>
            </form>
        </div>
    )
}