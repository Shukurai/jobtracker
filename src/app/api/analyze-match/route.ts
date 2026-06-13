import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { applicationId } = await req.json()

    const { data: profile } = await supabase
        .from('profiles')
        .select('resume_text, is_pro')
        .eq('id', user.id)
        .single()

    if (!profile?.is_pro) {
        return NextResponse.json({ error: 'AI Match Score is a Pro feature' }, { status: 403 })
    }

    if (!profile?.resume_text) {
        return NextResponse.json({ error: 'No resume saved. Add it in Settings.' }, { status: 400 })
    }

    const { data: application } = await supabase
        .from('applications')
        .select('position, company, job_description')
        .eq('id', applicationId)
        .eq('user_id', user.id)
        .single()

    if (!application?.job_description) {
        return NextResponse.json({ error: 'No job description for this application.' }, { status: 400 })
    }

    const prompt = `Resume:\n${profile.resume_text}\n\nJob: ${application.position} at ${application.company}\n${application.job_description}\n\nGive a match score (0-100) and 3 short bullet points on strengths/gaps. Respond ONLY with valid JSON, no markdown, no code fences: {"score": number, "points": string[]}`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 500,
            messages: [{ role: 'user', content: prompt }]
        })
    })

    if (!res.ok) {
        const err = await res.text()
        return NextResponse.json({ error: 'AI request failed', details: err }, { status: 500 })
    }

    const data = await res.json()
    const text = data.content?.[0]?.text ?? ''

    try {
        const cleaned = text.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(cleaned)

        await supabase
            .from('applications')
            .update({ ai_match_score: parsed })
            .eq('id', applicationId)

        return NextResponse.json(parsed)
    } catch {
        return NextResponse.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 })
    }
}