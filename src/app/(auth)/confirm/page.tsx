import Link from 'next/link'

export default function ConfirmPage() {
    return (
        <div className="min-h-screen bg-bg flex items-center justify-center px-6">
            <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-bg border border-border flex items-center justify-center mx-auto mb-6 text-2xl">
                    ✅
                </div>
                <h2 className="text-base font-semibold text-text mb-2">Email confirmed!</h2>
                <p className="text-xs text-muted mb-8 leading-relaxed">
                    Your account is ready. Start tracking your job applications.
                </p>
                <Link
                    href="/login"
                    className="block w-full py-2.5 bg-text text-bg rounded-lg text-sm font-semibold no-underline text-center hover:bg-accent-hover transition-colors"
                >
                    Sign in →
                </Link>
            </div>
        </div>
    )
}