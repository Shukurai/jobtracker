import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

const adminSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization')
    if (
        process.env.NODE_ENV === 'production' &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data: applications, error } = await supabase
        .from('applications')
        .select('*')
        .eq('follow_up_date', today)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!applications?.length) return NextResponse.json({ sent: 0 })

    const userIds = [...new Set(applications.map(a => a.user_id))]

    let sent = 0
    for (const userId of userIds) {
        console.log('Getting user for id:', userId)
        const { data: { user }, error: userError } = await adminSupabase.auth.admin.getUserById(userId)
        console.log('User:', user?.email, 'Error:', userError)
        if (!user?.email) continue

        const userApps = applications.filter(a => a.user_id === userId)
        const list = userApps.map(a => `• ${a.company} — ${a.position}`).join('\n')

        await resend.emails.send({
            from: 'JobTracker <onboarding@resend.dev>',
            to: user.email,
            subject: `Follow-up reminder: ${userApps.length} application${userApps.length > 1 ? 's' : ''} today`,
            text: `Hi!\n\nTime to follow up on these applications:\n\n${list}\n\nGood luck!\n\nJobTracker`,
        })

        sent++
    }
    console.log('Today:', today)
    console.log('Applications found:', applications?.length, applications)
    return NextResponse.json({ sent, applications: applications.length, userIds })
}