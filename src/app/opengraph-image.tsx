import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'JobTracker'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: '#090909',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ fontSize: 80, marginBottom: 24 }}>🎯</div>
                <div style={{ fontSize: 64, fontWeight: 800, color: '#f0f0f0', marginBottom: 16 }}>
                    JobTracker
                </div>
                <div style={{ fontSize: 28, color: '#6B7280', textAlign: 'center', maxWidth: 700 }}>
                    Track your job applications. Never miss a follow-up.
                </div>
            </div>
        ),
        { ...size }
    )
}