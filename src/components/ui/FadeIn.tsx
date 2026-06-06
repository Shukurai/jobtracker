'use client'

import { useEffect, useRef, useState } from 'react'

export default function FadeIn({
    children,
    delay = 0,
    className = '',
}: {
    children: React.ReactNode
    delay?: number
    className?: string
}) {
    const ref = useRef<HTMLDivElement>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => setVisible(true), delay)
                    observer.disconnect()
                }
            },
            { threshold: 0.1 }
        )
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [delay])

    return (
        <div ref={ref} className={`fade-in ${visible ? 'visible' : ''} ${className}`}>
            {children}
        </div>
    )
}