import Link from 'next/link'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-bg text-text">
            <nav className="flex items-center justify-between px-10 py-5 border-b border-border">
                <Link href="/" className="flex items-center gap-2.5 no-underline">
                    <div className="w-8 h-8 rounded-lg overflow-hidden">
                        <img src="/logo.png" alt="JobTracker" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-bold text-base text-text">JobTracker</span>
                </Link>
            </nav>

            <div className="max-w-2xl mx-auto px-10 py-16">
                <h1 className="text-3xl font-bold mb-2 tracking-tight">Privacy Policy</h1>
                <p className="text-xs text-muted mb-12">Last updated: June 2026</p>

                {[
                    {
                        title: 'Information we collect',
                        content: 'We collect your email address when you create an account. We store the job application data you enter — company names, positions, notes, and status updates. We do not collect any additional personal information.'
                    },
                    {
                        title: 'How we use your information',
                        content: 'Your data is used solely to provide the JobTracker service. We do not sell, share, or rent your personal information to third parties. Your job application data is private and only accessible by you.'
                    },
                    {
                        title: 'Data security',
                        content: 'We use Supabase for data storage, which implements row-level security. This means your data is isolated — no other user can access your applications. All data is transmitted over HTTPS.'
                    },
                    {
                        title: 'Cookies',
                        content: 'We use cookies solely for authentication purposes — to keep you logged in. We do not use tracking or advertising cookies.'
                    },
                    {
                        title: 'Data deletion',
                        content: 'You can delete your account and all associated data at any time from your account settings. Upon deletion, all your data is permanently removed from our systems.'
                    },
                    {
                        title: 'Contact',
                        content: 'If you have any questions about this privacy policy, please contact us at privacy@jobtracker.app.'
                    },
                ].map((section, i) => (
                    <div key={i} className="mb-8">
                        <h2 className="text-base font-semibold text-text mb-3">{section.title}</h2>
                        <p className="text-sm text-muted leading-relaxed">{section.content}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}