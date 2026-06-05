'use client'

import { useEffect } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

interface Props {
    message: string
    type: 'success' | 'error'
    onClose: () => void
}

export default function Toast({ message, type, onClose }: Props) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000)
        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3 shadow-2xl">
            {type === 'success'
                ? <CheckCircle size={16} className="text-success flex-shrink-0" />
                : <XCircle size={16} className="text-danger flex-shrink-0" />
            }
            <p className="text-sm text-text">{message}</p>
        </div>
    )
}