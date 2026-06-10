'use client'

import { useState, useEffect } from 'react'

export default function CookieBanner() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const accepted = localStorage.getItem('cookie-consent')
        if (!accepted) setVisible(true)
    }, [])

    const accept = () => {
        localStorage.setItem('cookie-consent', 'true')
        setVisible(false)
    }

    const decline = () => {
        localStorage.setItem('cookie-consent', 'false')
        setVisible(false)
    }

    if (!visible) return null

    return (
        <div style={{
            position: 'fixed',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#111',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 9999,
            maxWidth: '520px',
            width: 'calc(100% - 32px)',
            fontSize: '13px',
            color: '#aaa',
        }}>
            <span style={{ flex: 1 }}>
                We use cookies for authentication and analytics.{' '}
                <a href="/privacy" style={{ color: '#f0f0f0', textDecoration: 'underline' }}>Learn more</a>
            </span>
            <button onClick={decline} style={{
                background: 'transparent',
                border: '1px solid #333',
                borderRadius: '6px',
                padding: '6px 12px',
                color: '#aaa',
                cursor: 'pointer',
                fontSize: '12px',
                whiteSpace: 'nowrap',
            }}>Decline</button>
            <button onClick={accept} style={{
                background: '#f0f0f0',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                color: '#090909',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
            }}>Accept</button>
        </div>
    )
}