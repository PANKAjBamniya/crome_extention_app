import React, { useState, useMemo, useRef } from 'react'
import type { ChartPoint, ChartTimeRange } from '../../types/tokenDetails'

interface TokenPriceChartProps {
    data: Record<ChartTimeRange, ChartPoint[]>
    symbol?: string
    isPositive?: boolean
    onHoverPoint?: (point: ChartPoint | null) => void
    height?: number
}

const RANGES: { key: ChartTimeRange; label: string }[] = [
    { key: '1H', label: '1H' },
    { key: '1D', label: '1D' },
    { key: '1W', label: '1W' },
    { key: '1M', label: '1M' },
    { key: '1Y', label: '1Y' },
    { key: 'All', label: 'ALL' },
]

export const TokenPriceChart: React.FC<TokenPriceChartProps> = ({
    data,
    symbol = 'ETH',
    isPositive = true,
    onHoverPoint,
    height = 160,
}) => {
    const [selectedRange, setSelectedRange] = useState<ChartTimeRange>('1H')
    const [hoverIndex, setHoverIndex] = useState<number | null>(null)
    const svgRef = useRef<SVGSVGElement | null>(null)

    const points = data[selectedRange] || []

    const { minPrice, maxPrice, pathD, areaD, svgPoints, peakIndex } = useMemo(() => {
        if (!points || points.length === 0) {
            return { minPrice: 0, maxPrice: 0, pathD: '', areaD: '', svgPoints: [], peakIndex: 0 }
        }

        const prices = points.map((p) => p.price)
        let min = Math.min(...prices)
        let max = Math.max(...prices)

        // Find index of the peak/highest price to show the glowing dot when not hovering
        let peakIdx = 0
        let highest = -Infinity
        prices.forEach((pr, idx) => {
            if (pr > highest) {
                highest = pr
                peakIdx = idx
            }
        })

        if (min === max) {
            min = min * 0.98
            max = max * 1.02
        } else {
            const padding = (max - min) * 0.12
            min -= padding
            max += padding
        }

        const width = 360
        const h = height
        const topPadding = 16
        const bottomPadding = 12

        const calculated = points.map((p, i) => {
            const x = (i / (points.length - 1)) * width
            const normY = (p.price - min) / (max - min)
            const y = topPadding + (1 - normY) * (h - topPadding - bottomPadding)
            return { x, y, point: p }
        })

        // Build smooth curved path (Monotone cubic bezier)
        let line = `M ${calculated[0].x.toFixed(1)} ${calculated[0].y.toFixed(1)}`
        for (let i = 0; i < calculated.length - 1; i++) {
            const curr = calculated[i]
            const next = calculated[i + 1]
            const midX = (curr.x + next.x) / 2
            line += ` C ${midX.toFixed(1)} ${curr.y.toFixed(1)}, ${midX.toFixed(1)} ${next.y.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`
        }

        const lastX = calculated[calculated.length - 1].x.toFixed(1)
        const firstX = calculated[0].x.toFixed(1)
        const groundY = (height + 10).toFixed(1)

        const area = `${line} L ${lastX} ${groundY} L ${firstX} ${groundY} Z`

        return {
            minPrice: min,
            maxPrice: max,
            pathD: line,
            areaD: area,
            svgPoints: calculated,
            peakIndex: peakIdx,
        }
    }, [points, height])

    const strokeGradientId = `chart-stroke-grad-${symbol}`
    const areaGradientId = `chart-area-grad-${symbol}`

    const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
        if (!svgRef.current || svgPoints.length === 0) return

        const rect = svgRef.current.getBoundingClientRect()
        const clientX = e.clientX - rect.left
        const ratio = Math.max(0, Math.min(1, clientX / rect.width))
        const index = Math.round(ratio * (svgPoints.length - 1))

        setHoverIndex(index)
        onHoverPoint?.(svgPoints[index]?.point ?? null)
    }

    const handlePointerLeave = () => {
        setHoverIndex(null)
        onHoverPoint?.(null)
    }

    // Default indicator to the peak point if not actively hovering
    const displayIndex = hoverIndex !== null ? hoverIndex : (svgPoints.length > 0 ? (peakIndex || Math.floor(svgPoints.length * 0.72)) : null)
    const activePoint = displayIndex !== null && svgPoints[displayIndex] ? svgPoints[displayIndex] : null

    // Timestamp text for header
    const headerTimeText = useMemo(() => {
        if (hoverIndex !== null && activePoint?.point?.timestamp) {
            const d = new Date(activePoint.point.timestamp)
            return d.toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short',
            }).toUpperCase()
        }
        return 'OCT 24, 03:45 PM UTC'
    }, [hoverIndex, activePoint])

    // Header ticker price
    const headerPriceText = useMemo(() => {
        if (activePoint?.point) {
            const p = activePoint.point.price
            const formatted = p >= 1
                ? `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : `$${p.toFixed(4)}`
            return `${formatted} ${symbol}/USD`
        }
        return `$2,482.64 ${symbol}/USD`
    }, [activePoint, symbol])

    return (
        <div className="rounded-2xl border border-[#1A222F] bg-[#0D121A] p-4 select-none shadow-lg">
            {/* Chart Card Top Header */}
            <div className="flex items-center justify-between pb-2">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#8E9BAE]">
                    {headerTimeText}
                </span>
                <span className="font-mono text-xs font-bold text-[#48E5C2] tracking-tight">
                    {headerPriceText}
                </span>
            </div>

            {/* SVG Chart Drawing Canvas */}
            <div className="relative w-full overflow-hidden" style={{ height }}>
                <svg
                    ref={svgRef}
                    viewBox={`0 0 360 ${height}`}
                    preserveAspectRatio="none"
                    className="w-full h-full cursor-crosshair touch-none"
                    onPointerMove={handlePointerMove}
                    onPointerLeave={handlePointerLeave}
                >
                    <defs>
                        {/* Smooth gradient stroke */}
                        <linearGradient id={strokeGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#48E5C2" />
                            <stop offset="75%" stopColor="#48E5C2" />
                            <stop offset="100%" stopColor="#38BDF8" />
                        </linearGradient>

                        {/* Subtle glowing translucent gradient under curve */}
                        <linearGradient id={areaGradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#48E5C2" stopOpacity={0.28} />
                            <stop offset="50%" stopColor="#48E5C2" stopOpacity={0.08} />
                            <stop offset="100%" stopColor="#48E5C2" stopOpacity={0.0} />
                        </linearGradient>

                        {/* Glow Filter for Active Dot */}
                        <filter id="dot-glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Area fill */}
                    {areaD && (
                        <path
                            d={areaD}
                            fill={`url(#${areaGradientId})`}
                            className="transition-all duration-300"
                        />
                    )}

                    {/* Line stroke */}
                    {pathD && (
                        <path
                            d={pathD}
                            fill="none"
                            stroke={`url(#${strokeGradientId})`}
                            strokeWidth={2.4}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-all duration-300"
                        />
                    )}

                    {/* Active Marker Point */}
                    {activePoint && (
                        <g className="transition-all duration-150">
                            {/* Guideline only if user is actively hovering */}
                            {hoverIndex !== null && (
                                <line
                                    x1={activePoint.x}
                                    y1={0}
                                    x2={activePoint.x}
                                    y2={height}
                                    stroke="#232B3A"
                                    strokeWidth={1}
                                    strokeDasharray="3 3"
                                />
                            )}
                            {/* Outer pulsing ring with glow */}
                            <circle
                                cx={activePoint.x}
                                cy={activePoint.y}
                                r={7}
                                fill="#48E5C2"
                                fillOpacity={0.25}
                                stroke="#48E5C2"
                                strokeWidth={1.5}
                                filter="url(#dot-glow)"
                            />
                            {/* Inner solid dot */}
                            <circle
                                cx={activePoint.x}
                                cy={activePoint.y}
                                r={3.5}
                                fill="#48E5C2"
                                stroke="#0D121A"
                                strokeWidth={1.5}
                            />
                        </g>
                    )}
                </svg>
            </div>

            {/* Time Range Selector: 1H | 1D | 1W | 1M | 1Y | ALL */}
            <div className="mt-3 flex items-center justify-between rounded-full border border-[#1A222F]/60 bg-[#121721] p-1">
                {RANGES.map(({ key, label }) => {
                    const isSelected = selectedRange === key
                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => {
                                setSelectedRange(key)
                                setHoverIndex(null)
                                onHoverPoint?.(null)
                            }}
                            className={`rounded-full px-3.5 py-1 text-xs transition-all cursor-pointer ${isSelected
                                    ? 'bg-[#48E5C2] text-[#0B0E14] font-bold shadow-sm'
                                    : 'font-semibold text-[#8E9BAE] hover:text-[#FCFAF9]'
                                }`}
                        >
                            {label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default TokenPriceChart
