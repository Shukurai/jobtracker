'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark')

    useEffect(() => {
        const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
        const initial = saved ?? 'dark'
        setTheme(initial)
        document.documentElement.setAttribute('data-theme', initial)
    }, [])

    function toggle() {
        const next = theme === 'dark' ? 'light' : 'dark'
        setTheme(next)
        document.documentElement.setAttribute('data-theme', next)
        localStorage.setItem('theme', next)
    }

    return (
        <label className="inline-flex items-center relative cursor-pointer">
            <input
                className="peer hidden"
                type="checkbox"
                checked={theme === 'light'}
                onChange={toggle}
            />
            <div
                className="relative w-[36px] h-[18px] bg-zinc-700 peer-checked:bg-zinc-200 rounded-full
                after:absolute after:content-[''] after:w-[12px] after:h-[12px]
                after:bg-gradient-to-r after:from-orange-500 after:to-yellow-400
                peer-checked:after:from-zinc-900 peer-checked:after:to-zinc-900
                after:rounded-full after:top-[3px] after:left-[3px]
                peer-checked:after:left-[21px]
                shadow-sm duration-300 after:duration-300 after:shadow-md"
            ></div>
        </label>
    )
}