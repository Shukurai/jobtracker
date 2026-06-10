'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

declare const chrome: any

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [emailSent, setEmailSent] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({ email, password })
            if (error) setError(error.message)
            else setEmailSent(true)
        } else {
            const { error, data } = await supabase.auth.signInWithPassword({ email, password })
            if (error) setError(error.message)
            else {
                // Сохраняем токен для расширения
                const session = data.session
                if (session && typeof chrome !== 'undefined' && chrome.storage) {
                    chrome.storage.local.set({ access_token: session.access_token })
                }
                router.push('/board')
            }
        }

        setLoading(false)
    }

    if (emailSent) {
        return (
            <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-bg border border-border flex items-center justify-center mx-auto mb-6 text-2xl">
                    📬
                </div>
                <h2 className="text-base font-semibold text-text mb-2">Check your email</h2>
                <p className="text-xs text-muted mb-8 leading-relaxed">
                    We sent a confirmation link to <span className="text-text">{email}</span>. Click it to activate your account.
                </p>
                <Link
                    href="/"
                    className="block w-full py-2.5 bg-text text-bg rounded-lg text-sm font-semibold no-underline text-center hover:bg-accent-hover transition-colors"
                >
                    Back to home
                </Link>
            </div>
        )
    }

    return (
        <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-10">

            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 mb-3">
                    <img src="/icon.png" alt="JobTracker" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-xl font-bold text-text">JobTracker</h1>
                <p className="text-muted text-sm mt-1">
                    {isSignUp ? 'Create your account' : 'Welcome back'}
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-muted">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-lg text-text text-sm outline-none focus:border-muted transition-colors"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-muted">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
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
                    {loading ? 'Loading...' : isSignUp ? 'Create account' : 'Sign in'}
                </button>
            </form>

            {/* Toggle */}
            <p className="text-center mt-6 text-xs text-muted">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                    onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
                    className="text-text bg-transparent border-none cursor-pointer text-xs"
                >
                    {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
            </p>
        </div>
    )
}