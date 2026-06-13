import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { applicationId } = await req.json()

    const { data: profile } = await supabase
        .from('profiles')
        .select('resume_text')
        .eq('id', user.id)
        .single()

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

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        }
    )

    if (!res.ok) {
        const err = await res.text()
        return NextResponse.json({ error: 'AI request failed', details: err }, { status: 500 })
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    try {
        const cleaned = text.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(cleaned)
        return NextResponse.json(parsed)
    } catch {
        return NextResponse.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 })
    }
}