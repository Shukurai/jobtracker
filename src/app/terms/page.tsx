import Link from 'next/link'

export default function TermsPage() {
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
                <h1 className="text-3xl font-bold mb-2 tracking-tight">Terms of Service</h1>
                <p className="text-xs text-muted mb-12">Last updated: June 2026</p>

                {[
                    {
                        title: 'Acceptance of terms',
                        content: 'By using JobTracker, you agree to these terms. If you do not agree, please do not use the service.'
                    },
                    {
                        title: 'Use of service',
                        content: 'JobTracker is a job application tracking tool for personal use. You are responsible for maintaining the confidentiality of your account credentials. You agree not to misuse the service or attempt to access other users\' data.'
                    },
                    {
                        title: 'Free and Pro plans',
                        content: 'The free plan allows up to 15 job applications. The Pro plan ($5/month) provides unlimited applications and additional features. We reserve the right to change pricing with 30 days notice.'
                    },
                    {
                        title: 'Data ownership',
                        content: 'You own your data. We do not claim any rights over the content you enter into JobTracker. You can export or delete your data at any time.'
                    },
                    {
                        title: 'Limitation of liability',
                        content: 'JobTracker is provided "as is" without warranties. We are not liable for any loss of data or damages arising from use of the service. We recommend keeping backups of important information.'
                    },
                    {
                        title: 'Changes to terms',
                        content: 'We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.'
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