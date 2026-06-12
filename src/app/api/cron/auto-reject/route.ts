import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

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

    const fiveWeeksAgo = new Date()
    fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35)
    const cutoff = fiveWeeksAgo.toISOString().split('T')[0]

    const { data: applications, error } = await adminSupabase
        .from('applications')
        .update({ status: 'rejected' })
        .in('status', ['applied', 'phone_screen', 'interview'])
        .lt('applied_at', cutoff)
        .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!applications?.length) return NextResponse.json({ updated: 0 })

    // Группируем по пользователям и отправляем email
    const userIds = [...new Set(applications.map(a => a.user_id))]

    let emailsSent = 0
    for (const userId of userIds) {
        const { data: { user } } = await adminSupabase.auth.admin.getUserById(userId)
        if (!user?.email) continue

        const userApps = applications.filter(a => a.user_id === userId)
        const list = userApps.map(a => `• ${a.company} — ${a.position}`).join('\n')

        await resend.emails.send({
            from: 'JobTracker <onboarding@resend.dev>',
            to: user.email,
            subject: `${userApps.length} application${userApps.length > 1 ? 's' : ''} moved to Rejected`,
            text: `Hi!\n\nWe've moved the following application${userApps.length > 1 ? 's' : ''} to Rejected after 5 weeks of no response:\n\n${list}\n\nYou can always move them back manually if you hear something.\n\nJobTracker`,
        })

        emailsSent++
    }

    return NextResponse.json({ updated: applications.length, emailsSent })
}