'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, BarChart2, LogOut, Menu, X, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import ExportButtonStandalone from '@/components/board/ExportButtonStandalone'

const navItems = [
    { href: '/board', label: 'Board', icon: LayoutDashboard },
    { href: '/stats', label: 'Stats', icon: BarChart2 },
    { href: '/settings', label: 'Settings', icon: Settings },
]


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [email, setEmail] = useState<string | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const [isPro, setIsPro] = useState(false)
    const [appCount, setAppCount] = useState(0)

    useEffect(() => {
        async function loadCount() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            setEmail(user.email ?? null)

            const { data: profile } = await supabase
                .from('profiles')
                .select('is_pro')
                .eq('id', user.id)
                .single()
            setIsPro(profile?.is_pro ?? false)

            const { count } = await supabase
                .from('applications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
            setAppCount(count ?? 0)
        }

        loadCount()
        window.addEventListener('applications-changed', loadCount)
        return () => window.removeEventListener('applications-changed', loadCount)
    }, [pathname])

    async function handleLogout() {
        await supabase.auth.signOut({ scope: 'local' })
        router.push('/')
    }

    const avatar = email ? email[0].toUpperCase() : '?'

    console.log('email state:', email)
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
                {!isPro && (
                    <div className="px-3 py-2 mb-2">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-muted">{appCount} / 15</span>
                            {appCount >= 10 && (
                                <span className="text-xs text-warning">{15 - appCount} left</span>
                            )}
                        </div>
                        <div className="h-1 bg-border rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{
                                    width: `${Math.min((appCount / 15) * 100, 100)}%`,
                                    background: appCount >= 15 ? '#EF4444' : appCount >= 10 ? '#F59E0B' : '#22C55E'
                                }}
                            />
                        </div>
                    </div>
                )}        
                <div className="flex flex-col gap-2 border-t border-border pt-4">

                    {isPro && <ExportButtonStandalone />}
                    <div className="flex items-center gap-2.5 px-3 py-2">
                        <div className="w-7 h-7 rounded-full bg-border flex items-center justify-center text-xs font-semibold text-text flex-shrink-0">
                            {avatar}
                        </div>
                        <span className="text-xs text-muted truncate flex-1">{email ?? '...'}</span>
                        {isPro && (
                            <span className="text-xs font-bold text-warning bg-warning/10 px-1.5 py-0.5 rounded-md flex-shrink-0">
                                PRO
                            </span>
                        )}
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
            <main className="flex-1 md:ml-55 p-4 md:p-8 pb-24 md:pb-8 overflow-x-hidden">
                {children}
            </main>

            {/* Bottom nav — только на мобиле */}
            {/* Кнопка меню — только мобиле */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden fixed bottom-6 right-6 z-50 w-12 h-12 bg-text text-bg rounded-full flex items-center justify-center shadow-lg border-none cursor-pointer"
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Menu overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMenuOpen(false)}>
            <div
                className="absolute bottom-24 right-6 bg-surface border border-border rounded-2xl p-2 flex flex-col gap-1 min-w-40"
                onClick={e => e.stopPropagation()}
            >
        
            {/* Прогресс бар — только для free на мобиле */}
            {!isPro && (
                <div className="px-4 py-3 border-b border-border mb-1">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted">{appCount} / 15</span>
                        {appCount >= 10 && (
                            <span className="text-xs text-warning">{15 - appCount} left</span>
                        )}
                    </div>
                    <div className="h-1 bg-border rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all"
                            style={{
                                width: `${Math.min((appCount / 15) * 100, 100)}%`,
                                background: appCount >= 15 ? '#EF4444' : appCount >= 10 ? '#F59E0B' : '#22C55E'
                            }}
                        />
                    </div>
                </div>
            )}

            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm no-underline transition-colors
                    ${active ? 'bg-surface-hover text-text font-semibold' : 'text-muted hover:bg-surface-hover hover:text-text'}`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              )
            })}
            {isPro && <ExportButtonStandalone />}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-danger hover:bg-surface-hover transition-colors bg-transparent border-none cursor-pointer w-full"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      )}

        </div>
    )
}