'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, BarChart2, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'

const navItems = [
    { href: '/board', label: 'Board', icon: LayoutDashboard },
    { href: '/stats', label: 'Stats', icon: BarChart2 },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [email, setEmail] = useState<string | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setEmail(data.user?.email ?? null)
        })
    }, [])

    async function handleLogout() {
        await supabase.auth.signOut({ scope: 'local' })
        router.push('/')
    }

    const avatar = email ? email[0].toUpperCase() : '?'

    return (
        <div className="flex min-h-screen bg-bg">

            {/* Sidebar — только на md+ */}
            <aside className="hidden md:flex w-55 min-h-screen bg-surface border-r border-border flex-col px-3 py-6 fixed top-0 left-0">
                <div className="flex items-center gap-2.5 px-2 mb-8">
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                        <img src="/icon.png" alt="JobTracker" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-bold text-base text-text">JobTracker</span>
                </div>

                <nav className="flex flex-col gap-1 flex-1">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const active = pathname === href
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={active
                                    ? 'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-text bg-surface-hover no-underline'
                                    : 'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-normal text-muted hover:bg-surface-hover hover:text-text no-underline'
                                }
                            >
                                <Icon size={16} />
                                {label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="flex flex-col gap-2 border-t border-border pt-4">
                    <div className="flex items-center gap-2.5 px-3 py-2">
                        <div className="w-7 h-7 rounded-full bg-border flex items-center justify-center text-xs font-semibold text-text flex-shrink-0">
                            {avatar}
                        </div>
                        <span className="text-xs text-muted truncate">{email ?? '...'}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:bg-surface-hover hover:text-text transition-all w-full bg-transparent border-none cursor-pointer"
                    >
                        <LogOut size={16} />
                        Log out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 md:ml-55 p-4 md:p-8 pb-24 md:pb-8">
                {children}
            </main>

            {/* Bottom nav — только на мобиле */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex items-center z-40">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex-1 flex flex-col items-center gap-1 py-3 no-underline transition-colors
                ${active ? 'text-text' : 'text-muted'}`}
                        >
                            <Icon size={20} />
                            <span className="text-xs">{label}</span>
                        </Link>
                    )
                })}
                <button
                    onClick={handleLogout}
                    className="flex-1 flex flex-col items-center gap-1 py-3 text-muted bg-transparent border-none cursor-pointer"
                >
                    <LogOut size={20} />
                    <span className="text-xs">Logout</span>
                </button>
            </nav>

        </div>
    )
}