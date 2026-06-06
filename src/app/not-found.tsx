import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-center px-6">
            <p className="text-8xl font-extrabold text-border mb-4">404</p>
            <h1 className="text-2xl font-bold text-text mb-3">Page not found</h1>
            <p className="text-sm text-muted mb-8 max-w-sm">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Link
                href="/"
                className="bg-text text-bg px-6 py-2.5 rounded-lg text-sm font-semibold no-underline hover:bg-accent-hover transition-colors"
            >
                Back to home
            </Link>
        </div>
    )
}