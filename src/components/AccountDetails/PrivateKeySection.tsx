import React, { useState, useEffect } from 'react'
import { Key, Eye, EyeOff, Copy, Check, AlertTriangle, Clock } from 'lucide-react'

interface PrivateKeySectionProps {
    privateKey?: string
    isRevealed: boolean
    onRequestReveal: () => void
    onHide: () => void
}

export const PrivateKeySection: React.FC<PrivateKeySectionProps> = ({
    privateKey,
    isRevealed,
    onRequestReveal,
    onHide,
}) => {
    const [copied, setCopied] = useState(false)
    const [countdown, setCountdown] = useState(60)

    useEffect(() => {
        if (!isRevealed) {
            setCountdown(60)
            return
        }

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    onHide()
                    return 60
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [isRevealed, onHide])

    const handleCopy = async () => {
        if (!privateKey) return
        try {
            await navigator.clipboard.writeText(privateKey)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Clipboard error handling without logging secret
        }
    }

    return (
        <div className="rounded-2xl border border-[#5E5E5E]/20 bg-black p-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#5E5E5E]/20">
                <div className="flex items-center gap-2">
                    <Key size={15} className="text-[#48E5C2]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#5E5E5E]">
                        Private Key
                    </span>
                </div>
                {isRevealed && (
                    <div className="flex items-center gap-1 text-[11px] text-amber-400">
                        <Clock size={12} />
                        <span>Hiding in {countdown}s</span>
                    </div>
                )}
            </div>

            {!isRevealed ? (
                <div className="mt-3">
                    <div className="rounded-xl border border-[#5E5E5E]/20 bg-black px-3.5 py-3 text-center">
                        <p className="font-mono text-sm tracking-widest text-[#5E5E5E] select-none">
                            ••••••••••••••••••••••••••••••••••••••••••••••••
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onRequestReveal}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-black border border-[#5E5E5E]/30 px-4 py-2.5 text-xs font-semibold text-[#FCFAF9] transition-all hover:border-[#48E5C2] active:scale-[0.99]"
                    >
                        <Eye size={14} className="text-[#48E5C2]" />
                        <span>Reveal Private Key</span>
                    </button>
                </div>
            ) : (
                <div className="mt-3 space-y-3">
                    {/* Warning Banner */}
                    <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs text-amber-400">
                        <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-4 text-amber-300">
                            <strong>Never share your private key.</strong> Anyone with this key can access all your funds and assets permanently.
                        </p>
                    </div>

                    {/* Monospace Private Key */}
                    <div className="rounded-xl border border-[#5E5E5E]/20 bg-black p-3">
                        <p className="break-all font-mono text-xs text-[#48E5C2] leading-5 select-all">
                            {privateKey || ''}
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#48E5C2] px-3 py-2 text-xs font-semibold text-black transition-opacity hover:opacity-90"
                        >
                            {copied ? (
                                <>
                                    <Check size={14} />
                                    <span>Copied</span>
                                </>
                            ) : (
                                <>
                                    <Copy size={14} />
                                    <span>Copy Key</span>
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onHide}
                            className="flex items-center justify-center gap-1.5 rounded-xl border border-[#5E5E5E]/30 bg-black px-4 py-2 text-xs font-medium text-[#5E5E5E] transition-colors hover:border-[#5E5E5E]/50 hover:text-[#FCFAF9]"
                        >
                            <EyeOff size={14} />
                            <span>Hide</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PrivateKeySection

