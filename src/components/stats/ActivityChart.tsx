'use client'

import { useState } from 'react'

interface DataPoint {
    label: string
    count: number
}

export default function ActivityChart({ data }: { data: DataPoint[] }) {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; point: DataPoint } | null>(null)

    const width = 600
    const height = 120
    const paddingLeft = 30
    const paddingRight = 16
    const paddingTop = 16
    const paddingBottom = 24

    const maxVal = Math.max(...data.map(d => d.count), 1)
    const chartWidth = width - paddingLeft - paddingRight
    const chartHeight = height - paddingTop - paddingBottom

    const points = data.map((d, i) => ({
        x: paddingLeft + (i / (data.length - 1)) * chartWidth,
        y: paddingTop + chartHeight - (d.count / maxVal) * chartHeight,
        ...d,
    }))

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`

    // Y axis labels
    const yLabels = [0, Math.round(maxVal / 2), maxVal]

    return (
        <div className="relative w-full">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full"
                style={{ overflow: 'visible' }}
                onMouseLeave={() => setTooltip(null)}
            >
                {/* Grid lines */}
                {yLabels.map((val, i) => {
                    const y = paddingTop + chartHeight - (val / maxVal) * chartHeight
                    return (
                        <g key={i}>
                            <line
                                x1={paddingLeft} y1={y}
                                x2={width - paddingRight} y2={y}
                                stroke="var(--color-border)" strokeWidth="1"
                            />
                            <text
                                x={paddingLeft - 6} y={y + 4}
                                textAnchor="end"
                                fill="var(--color-muted)"
                                fontSize="10"
                            >
                                {val}
                            </text>
                        </g>
                    )
                })}

                {/* Area fill */}
                <path d={areaD} fill="var(--color-text)" opacity="0.05" />

                {/* Line */}
                <path
                    d={pathD}
                    fill="none"
                    stroke="var(--color-text)"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />

                {/* Points */}
                {points.map((p, i) => (
                    <g key={i}>
                        <circle
                            cx={p.x} cy={p.y} r="3"
                            fill={p.count > 0 ? 'var(--color-text)' : 'var(--color-border)'}
                            stroke="var(--color-text)"
                            strokeWidth="1.5"
                        />
                        ...
                    </g>
                ))}

                {/* X axis labels */}
                {points.map((p, i) => (
                    <text
                        key={i}
                        x={p.x} y={height - 4}
                        textAnchor="middle"
                        fill="var(--color-muted)"
                        fontSize="9"
                    >
                        {p.label}
                    </text>
                ))}
            </svg>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="absolute pointer-events-none px-2.5 py-1.5 bg-surface-hover border border-border rounded-lg text-xs text-text whitespace-nowrap z-10 shadow-lg"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y - 40,
                        transform: 'translateX(-50%)',
                    }}
                >
                    <span className="font-semibold">{tooltip.point.count}</span>
                    <span className="text-muted ml-1">applications</span>
                    <div className="text-muted">{tooltip.point.label}</div>
                </div>
            )}
        </div>
    )
}