import Link from 'next/link'
import { LayoutDashboard, BarChart2, Bell, Zap, Shield, Globe } from 'lucide-react'
import Image from 'next/image'
import FadeIn from '@/components/ui/FadeIn'


export default function LandingPage() {
    return (
        <div className="bg-bg text-text min-h-screen">

            {/* Nav */}
            <nav className="flex items-center justify-between px-10 py-5 border-b border-border">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg overflow-hidden">
                        <img src="/logo.png" alt="JobTracker" width={32} height={32} className="rounded-lg" />
                    </div>
                    <span className="font-bold text-base">JobTracker</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/login" className="text-muted text-sm no-underline hover:text-text transition-colors">
                        Sign in
                    </Link>
                    <Link href="/login" className="bg-text text-bg px-4 py-2 rounded-lg text-sm font-semibold no-underline hover:bg-accent-hover transition-colors">
                        Get started
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="text-center px-10 pt-24 pb-20">
                <div className="inline-block bg-surface border border-green-900 rounded-full px-4 py-1.5 text-xs text-muted mb-8">
                    <div className="flex gap-1">
                        <div className="text-green-500" >Free to start</div> · No credit card required
                    </div>
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6">
                    Stop losing track of<br />
                    <span className="text-muted">your job applications</span>
                </h1>
                <p className="text-lg text-muted max-w-md mx-auto mb-10 leading-relaxed">
                    A clean Kanban board for your job search. Track every application, see your progress, never miss a follow-up.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                    <Link href="/login" className="bg-text text-bg px-7 py-3.5 rounded-xl text-sm font-bold no-underline hover:bg-accent-hover transition-colors">
                        Start for free →
                    </Link>
                    <Link href="#features" className="bg-transparent text-text border border-border px-7 py-3.5 rounded-xl text-sm font-medium no-underline hover:border-muted transition-colors">
                        See features
                    </Link>
                </div>
            </section>

            {/* Stats */}
            <section className="px-10 pb-16 max-w-4xl mx-auto">
                <div className="grid grid-cols-3 gap-2 md:gap-3 mb-8">
                    {[
                        { value: '2,400+', label: 'Applications tracked' },
                        { value: '180+', label: 'Job seekers' },
                        { value: '94%', label: 'Would recommend' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-surface border border-border rounded-2xl p-6 text-center">
                            <p className="text-2xl md:text-3xl font-extrabold text-text tracking-tight mb-1">{stat.value}</p>
                            <p className="text-xs text-muted text-center">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Preview */}
            <section className="px-10 pb-24 max-w-5xl mx-auto">
                <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl">
                    <img
                        src="/screenshot.png"
                        alt="JobTracker board preview"
                        className="w-full h-auto"
                    />
                </div>
            </section>

            {/* Features */}
            <FadeIn delay={100}>
            <section id="features" className="px-10 py-20 max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-14 tracking-tight">Everything you need</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: LayoutDashboard, title: 'Kanban Board', desc: 'Visual pipeline from wishlist to offer. Drag & drop between stages.' },
                        { icon: BarChart2, title: 'Stats & Insights', desc: 'Track your response rate, active applications, and success metrics.' },
                        { icon: Bell, title: 'Early adopter pricing', desc: 'Subscribe now and lock in $4.99/month forever — price will increase as we add more features.' },
                        { icon: Zap, title: 'Fast & Simple', desc: 'Add an application in seconds. No bloat, no onboarding, just work.' },
                        { icon: Shield, title: 'Your data is safe', desc: 'Row-level security. Only you can see your applications.' },
                        { icon: Globe, title: 'Works everywhere', desc: 'Fully responsive. Track your search from any device.' },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="bg-surface border border-border rounded-2xl p-6">
                            <div className="w-9 h-9 bg-bg border border-border rounded-lg flex items-center justify-center mb-4">
                                <Icon size={16} className="text-text" />
                            </div>
                            <h3 className="text-sm font-semibold mb-2">{title}</h3>
                            <p className="text-xs text-muted leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>
            </FadeIn>

            <FadeIn delay={50}>        
            {/* Pricing */}
            <section className="px-10 py-20 max-w-xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-4 tracking-tight">Simple pricing</h2>
                <p className="text-muted text-sm mb-12">Start free, upgrade when you need more.</p>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        {
                            name: 'Free', price: '$0', period: 'forever',
                            features: ['Up to 15 applications', 'Kanban board', 'Basic stats'],
                            cta: 'Get started', highlight: false,
                        },
                        {
                            name: 'Pro', price: '$4.99', period: 'per month',
                            features: ['Unlimited applications', 'Export to Excel', 'Priority support', 'Early adopter price — locked in forever'],
                            cta: 'Start Pro', highlight: true,
                        },
                    ].map(plan => (
                        <div
                            key={plan.name}
                            className={`rounded-2xl p-7 text-left ${plan.highlight ? 'bg-text' : 'bg-surface border border-border'}`}
                        >
                            <p className={`text-xs font-semibold mb-2 ${plan.highlight ? 'text-bg opacity-60' : 'text-muted'}`}>{plan.name}</p>
                            <p className={`text-4xl font-extrabold tracking-tight mb-1 ${plan.highlight ? 'text-bg' : 'text-text'}`}>{plan.price}</p>
                            <p className={`text-xs mb-6 ${plan.highlight ? 'text-bg opacity-50' : 'text-muted'}`}>{plan.period}</p>
                            <ul className="mb-6 flex flex-col gap-2.5">
                                {plan.features.map(f => (
                                    <li key={f} className={`text-xs flex items-center gap-2 ${plan.highlight ? 'text-bg' : 'text-text'}`}>
                                        <span className={plan.highlight ? 'text-bg' : 'text-success'}>✓</span> {f}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="/login"
                                className={`block text-center py-2.5 rounded-lg text-xs font-bold no-underline transition-colors
                  ${plan.highlight ? 'bg-bg text-text hover:opacity-90' : 'bg-text text-bg hover:bg-accent-hover'}`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </section>
            </FadeIn>

            <FadeIn>
            {/* FAQ */}
            <section className="px-10 py-20 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-14 tracking-tight">FAQ</h2>
                <div className="flex flex-col gap-4">
                    {[
                        {
                            q: 'Is JobTracker really free?',
                            a: 'Yes — up to 15 applications are completely free, no credit card required. Upgrade to Pro for unlimited applications and extra features.'
                        },
                        {
                            q: 'How is this different from a spreadsheet?',
                            a: 'JobTracker gives you a visual Kanban board, automatic date tracking, color-coded urgency, and company logos — all without setup. A spreadsheet requires manual work every time.'
                        },
                        {
                            q: 'Is my data safe?',
                            a: 'Yes. Your data is stored securely with row-level security — only you can access your applications. We never sell or share your data.'
                        },
                        {
                            q: 'Can I use it on mobile?',
                            a: 'Yes — JobTracker is fully responsive and works on any device.'
                        },
                        {
                            q: 'Can I cancel anytime?',
                            a: 'Yes. No contracts, no commitments. Cancel your Pro subscription anytime from your account settings.'
                        },
                    ].map((item, i) => (
                        <div key={i} className="bg-surface border border-border rounded-2xl px-6 py-5">
                            <p className="text-sm font-semibold text-text mb-2">{item.q}</p>
                            <p className="text-xs text-muted leading-relaxed">{item.a}</p>
                        </div>
                    ))}
                </div>
            </section>
            </FadeIn>

            <FadeIn>        
            {/* CTA */}
            <section className="px-10 py-20 text-center">
                <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Ready to get organized?</h2>
                <p className="text-muted text-sm mb-8">Join job seekers who track smarter.</p>
                <Link href="/login" className="bg-text text-bg px-8 py-3.5 rounded-xl text-sm font-bold no-underline hover:bg-accent-hover transition-colors">
                    Start for free →
                </Link>
            </section>
            </FadeIn>    

            {/* Footer */}
            <footer className="border-t border-border px-10 py-6 flex justify-between items-center flex-wrap gap-4">
                <span className="text-xs text-muted">© 2026 JobTracker</span>
                <div className="flex gap-6">
                    <Link href="/privacy" className="text-xs text-muted hover:text-text no-underline transition-colors">Privacy</Link>
                    <Link href="/terms" className="text-xs text-muted hover:text-text no-underline transition-colors">Terms</Link>
                </div>
                <span className="text-xs text-muted">Built for job seekers</span>
            </footer>

        </div>
    )
}