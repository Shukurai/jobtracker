import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    const supabase = await createClient()

    // Верифицируем токен
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await req.json()
    const { company, position, status, url, description } = body

    if (!company || !position) {
        return NextResponse.json({ error: 'company and position are required' }, { status: 400 })
    }

    // Проверяем лимит (15 для free)
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_pro')
        .eq('id', user.id)
        .single()

    if (!profile?.is_pro) {
        const { count } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        if ((count ?? 0) >= 15) {
            return NextResponse.json({ error: 'Free limit reached' }, { status: 403 })
        }
    }

    const { data, error } = await supabase
        .from('applications')
        .insert({
            user_id: user.id,
            company,
            position,
            url: url || null,
            status: status || 'applied',
            applied_at: new Date().toISOString().split('T')[0],
            job_description: description || null,
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
}