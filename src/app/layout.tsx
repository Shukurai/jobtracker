import type { Metadata, Viewport } from 'next'
import CookieBanner from '@/components/ui/CookieBanner'
import './globals.css'

export const metadata: Metadata = {
    title: 'JobTracker',
    description: 'Track your job applications. A clean Kanban board for your job search.',
    openGraph: {
        title: 'JobTracker',
        description: 'Track your job applications. A clean Kanban board for your job search.',
        url: 'https://jobtracker-three-delta.vercel.app',
        siteName: 'JobTracker',
        type: 'website',
        images: [
            {
                url: 'https://jobtracker-three-delta.vercel.app/og-image.png',
                width: 1200,
                height: 630,
                alt: 'JobTracker',
            }
        ],
    },
    twitter: {
        card: 'summary',
        title: 'JobTracker',
        description: 'Track your job applications. A clean Kanban board for your job search.',
    },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                {children}
                <CookieBanner />
            </body>
        </html>
    )
}

