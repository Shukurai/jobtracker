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

    console.log('full checkout:', JSON.stringify(checkout, null, 2))

    const url = checkout.data?.data?.attributes?.url ??
        (checkout as any)?.data?.attributes?.url ??
        (checkout as any)?.url

    console.log('resolved url:', url)
    console.log('errors:', JSON.stringify(checkout.error))
    console.log('api key exists:', !!process.env.LEMONSQUEEZY_API_KEY)
    console.log('api key length:', process.env.LEMONSQUEEZY_API_KEY?.length)
    
    return NextResponse.json({ url })
}