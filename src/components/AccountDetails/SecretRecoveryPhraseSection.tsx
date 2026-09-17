import React, { useState, useEffect } from 'react'
import { Shield, Eye, EyeOff, Copy, Check, AlertTriangle, Clock, Info } from 'lucide-react'

interface SecretRecoveryPhraseSectionProps {
    seedPhrase?: string
    isRevealed: boolean
    hasSrp: boolean
    onRequestReveal: () => void
    onHide: () => void
}

export const SecretRecoveryPhraseSection: React.FC<SecretRecoveryPhraseSectionProps> = ({
    seedPhrase,
    isRevealed,
    hasSrp,
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

    const words = seedPhrase ? seedPhrase.trim().split(/\s+/) : []

    const handleCopy = async () => {
        if (!seedPhrase) return
        try {
            await navigator.clipboard.writeText(seedPhrase.trim())
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
                    <Shield size={15} className="text-[#48E5C2]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#5E5E5E]">
                        Secret Recovery Phrase
                    </span>
                </div>
                {hasSrp && isRevealed && (
                    <div className="flex items-center gap-1 text-[11px] text-amber-400">
                        <Clock size={12} />
                        <span>Hiding in {countdown}s</span>
                    </div>
                )}
            </div>

            {!hasSrp ? (
                /* Imported Private Key Account with no SRP */
                <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-[#5E5E5E]/20 bg-black p-3 text-xs text-[#5E5E5E]">
                    <Info size={16} className="text-[#48E5C2] shrink-0 mt-0.5" />
                    <p className="leading-5">
                        Secret Recovery Phrase is not available for this imported account. It was imported directly via private key.
                    </p>
                </div>
            ) : !isRevealed ? (
                /* Hidden state */
                <div className="mt-3">
                    <div className="rounded-xl border border-[#5E5E5E]/20 bg-black px-3.5 py-3 text-center">
                        <p className="font-mono text-sm tracking-widest text-[#5E5E5E] select-none">
                            •••• •••• •••• •••• •••• ••••
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onRequestReveal}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-black border border-[#5E5E5E]/30 px-4 py-2.5 text-xs font-semibold text-[#FCFAF9] transition-all hover:border-[#48E5C2] active:scale-[0.99]"
                    >
                        <Eye size={14} className="text-[#48E5C2]" />
                        <span>Reveal Secret Recovery Phrase</span>
                    </button>
                </div>
            ) : (
                /* Revealed 12-word state */
                <div className="mt-3 space-y-3">
                    {/* Warning Banner */}
                    <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs text-amber-400">
                        <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-4 text-amber-300">
                            <strong>Never share your Secret Recovery Phrase.</strong> Anyone with these words can take full control of your wallet and funds.
                        </p>
                    </div>

                    {/* Word grid */}
                    <div className="grid grid-cols-3 gap-2 rounded-xl border border-[#5E5E5E]/20 bg-black p-3">
                        {words.map((word, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-1.5 rounded-lg border border-[#5E5E5E]/20 bg-black px-2 py-1.5"
                            >
                                <span className="text-[10px] font-mono text-[#5E5E5E] w-4 text-right">
                                    {index + 1}.
                                </span>
                                <span className="text-xs font-medium text-[#FCFAF9] select-all">
                                    {word}
                                </span>
                            </div>
                        ))}
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
                                    <span>Copied Phrase</span>
                                </>
                            ) : (
                                <>
                                    <Copy size={14} />
                                    <span>Copy Phrase</span>
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

export default SecretRecoveryPhraseSection

