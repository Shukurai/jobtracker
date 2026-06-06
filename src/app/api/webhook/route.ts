import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
    const body = await request.text()
    const signature = request.headers.get('x-signature')
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!

    const hmac = crypto.createHmac('sha256', secret)
    const digest = hmac.update(body).digest('hex')

    if (signature !== digest) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)
    const eventName = payload.meta.event_name
    const userId = payload.meta.custom_data?.user_id

    if (!userId) return NextResponse.json({ ok: true })

    const supabase = await createClient()

    if (eventName === 'subscription_created' || eventName === 'subscription_resumed') {
        await supabase
            .from('profiles')
            .upsert({ id: userId, is_pro: true })
    }

    if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
        await supabase
            .from('profiles')
            .upsert({ id: userId, is_pro: false })
    }

    return NextResponse.json({ ok: true })
}