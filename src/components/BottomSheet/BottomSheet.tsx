import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react'
import { BottomSheetProps } from './BottomSheet.types'

const parseSnapPointToPx = (
    snap: string | number | undefined,
    windowHeight: number
): number | null => {
    if (!snap) return null
    if (typeof snap === 'number') return snap
    if (typeof snap === 'string' && snap.endsWith('%')) {
        const percent = parseFloat(snap) / 100
        return Math.round(windowHeight * percent)
    }
    const parsed = parseFloat(snap)
    return isNaN(parsed) ? null : parsed
}

const BottomSheet: React.FC<BottomSheetProps> = ({
    visible,
    onClose,
    children,
    snapPoints,
    initialSnapPoint,
    closeOnBackdropPress = true,
    showDragHandle = true,
    className = '',
    backdropClassName = '',
}) => {
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800
    const resolvedInitialHeight = parseSnapPointToPx(
        initialSnapPoint || (snapPoints && snapPoints[0]),
        windowHeight
    )

    const [isRendered, setIsRendered] = useState(visible)
    const [isClosing, setIsClosing] = useState(false)
    const [dragOffsetY, setDragOffsetY] = useState(0)
    const [openOffsetY, setOpenOffsetY] = useState(windowHeight)
    const [isDragging, setIsDragging] = useState(false)

    const startYRef = useRef(0)
    const currentYRef = useRef(0)
    const lastTimestampRef = useRef(0)
    const velocityYRef = useRef(0)
    const sheetRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (visible) {
            setIsRendered(true)
            setIsClosing(false)
            setDragOffsetY(0)

            // Start below viewport and animate up to final position
            setOpenOffsetY(windowHeight)

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setOpenOffsetY(0)
                })
            })
        } else if (isRendered && !isClosing) {
            handleClose()
        }
    }, [visible, windowHeight])

    const handleClose = useCallback(() => {
        setIsClosing(true)
        setDragOffsetY(0)
        const timer = setTimeout(() => {
            setIsRendered(false)
            setIsClosing(false)
            setOpenOffsetY(windowHeight)
            onClose()
        }, 400)
        return () => clearTimeout(timer)
    }, [onClose, windowHeight])

    // Escape key listener
    useEffect(() => {
        if (!visible) return
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && closeOnBackdropPress) {
                handleClose()
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [visible, closeOnBackdropPress, handleClose])

    // Prevent background body scroll when open
    useEffect(() => {
        if (isRendered) {
            const originalOverflow = document.body.style.overflow
            document.body.style.overflow = 'hidden'
            return () => {
                document.body.style.overflow = originalOverflow
            }
        }
    }, [isRendered])

    // Pointer gesture handling
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0) return
        setIsDragging(true)
        startYRef.current = e.clientY
        currentYRef.current = e.clientY
        lastTimestampRef.current = Date.now()
        velocityYRef.current = 0

        if (e.currentTarget.setPointerCapture) {
            try {
                e.currentTarget.setPointerCapture(e.pointerId)
            } catch {
                // ignore
            }
        }
    }

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return
        const now = Date.now()
        const dt = now - lastTimestampRef.current
        const dy = e.clientY - currentYRef.current

        if (dt > 0) {
            velocityYRef.current = dy / dt
        }

        currentYRef.current = e.clientY
        lastTimestampRef.current = now

        const totalDelta = e.clientY - startYRef.current
        if (totalDelta >= 0) {
            setDragOffsetY(totalDelta)
        } else {
            // Rubber-band resistance upward
            setDragOffsetY(totalDelta * 0.3)
        }
    }

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return
        setIsDragging(false)

        if (e.currentTarget.releasePointerCapture) {
            try {
                e.currentTarget.releasePointerCapture(e.pointerId)
            } catch {
                // ignore
            }
        }

        const totalDelta = e.clientY - startYRef.current
        const velocity = velocityYRef.current

        // Close if dragged down past 80px or fast downward flick
        if (totalDelta > 80 || (totalDelta > 30 && velocity > 0.5)) {
            handleClose()
        } else {
            setDragOffsetY(0)
        }
    }

    if (!isRendered) return null

    const backdropOpacityClass =
        isClosing || !visible ? 'opacity-0' : 'opacity-100'

    const sheetTransform =
        isClosing || !visible
            ? 'translateY(100%)'
            : `translateY(${openOffsetY + Math.max(0, dragOffsetY)}px)`

    const heightStyle: React.CSSProperties = resolvedInitialHeight
        ? { maxHeight: `${resolvedInitialHeight}px` }
        : {}

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden"
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`fixed inset-0 bg-black/50 transition-opacity duration-200 ease-out ${backdropOpacityClass} ${backdropClassName}`}
                onClick={closeOnBackdropPress ? handleClose : undefined}
                aria-hidden="true"
            />

            <div
                ref={sheetRef}
                style={{
                    transform: sheetTransform,
                    transition: isDragging
                        ? 'none'
                        : 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1)',
                    ...heightStyle,
                }}
                className={`relative w-full max-w-md rounded-t-3xl border-t border-x border-white/10 bg-[#121315] pb-[max(1rem,env(safe-area-inset-bottom,0px))] shadow-2xl z-50 flex flex-col will-change-transform ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {showDragHandle && (
                    <div
                        className="w-full pt-3 pb-2 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                    >
                        <div className="h-1 w-10 rounded-full bg-white/25 transition-colors hover:bg-white/40" />
                    </div>
                )}
                <div className="flex-1 overflow-y-auto px-5 pb-4">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default React.memo(BottomSheet)