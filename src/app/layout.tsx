import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'JobTracker',
    description: 'Track your job applications',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}