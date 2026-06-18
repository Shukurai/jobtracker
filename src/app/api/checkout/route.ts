import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
    const { lemonSqueezySetup, createCheckout } = await import('@lemonsqueezy/lemonsqueezy.js')

    lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const checkout = await createCheckout(
        Number(process.env.LEMONSQUEEZY_STORE_ID!),
        Number(process.env.LEMONSQUEEZY_VARIANT_ID!),
        {
            checkoutData: {
                email: user.email,
                custom: { user_id: user.id },
            },
            productOptions: {
                redirectUrl: 'https://jobtracker-three-delta.vercel.app/board?upgraded=true',
            },
        }
    )

    console.log('Checkout response:', JSON.stringify(checkout, null, 2))

    const url = checkout.data?.data?.attributes?.url ??
        (checkout as any)?.data?.attributes?.url ??
        (checkout as any)?.url

    if (!url) {
        return NextResponse.json({ error: 'Failed to create checkout', debug: checkout }, { status: 500 })
    }

    return NextResponse.json({ url })

}