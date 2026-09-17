import React, { useState, useEffect } from 'react'
import { ArrowLeft, Key, Copy, Check, EyeOff, AlertTriangle, Clock } from 'lucide-react'
import type { AccountItem } from '../../store/slices/walletSlice'

interface PrivateKeyPageProps {
    account: AccountItem
    privateKey?: string
    onBack: () => void
    onHide: () => void
}

export const PrivateKeyPage: React.FC<PrivateKeyPageProps> = ({
    account,
    privateKey,
    onBack,
    onHide,
}) => {
    const [copied, setCopied] = useState(false)
    const [countdown, setCountdown] = useState(30)

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    onHide()
                    return 30
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [onHide])

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

    const formattedAddress = account.address
        ? `${account.address.slice(0, 8)}...${account.address.slice(-6)}`
        : ''

    return (
        <div className="fixed inset-0 z-40 flex h-full w-full flex-col bg-black text-[#FCFAF9]">
            {/* Background Glow */}
            <div
                className="
                    pointer-events-none
                    absolute
                    left-1/2
                    top-1/4
                    h-[300px]
                    w-[300px]
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-[#48E5C2]
                    opacity-[0.03]
                    blur-[100px]
                "
            />

            <div className="relative mx-auto flex h-full w-full max-w-md flex-col">
                {/* Header */}
                <div className="shrink-0 flex items-center justify-between border-b border-[#5E5E5E]/20 px-5 pt-4 pb-3">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onBack}
                            className="rounded-lg p-1.5 text-[#5E5E5E] hover:bg-[#5E5E5E]/10 hover:text-[#FCFAF9] transition-colors cursor-pointer"
                            aria-label="Back to Account Details"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <h1 className="text-base font-semibold text-[#FCFAF9]">
                            Private Key
                        </h1>
                    </div>

                    <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-400">
                        <Clock size={12} />
                        <span>Hiding in {countdown}s</span>
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                    {/* Account Overview Bar */}
                    <div className="flex items-center justify-between rounded-xl border border-[#5E5E5E]/20 bg-black p-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#48E5C2]/30 bg-[#48E5C2]/10 text-[#48E5C2]">
                                <Key size={15} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#FCFAF9]">
                                    {account.walletName || 'Account'}
                                </p>
                                <p className="font-mono text-[11px] text-[#5E5E5E]">
                                    {formattedAddress}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Security Warning */}
                    <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-amber-300">
                        <AlertTriangle size={17} className="shrink-0 mt-0.5 text-amber-400" />
                        <div className="space-y-1 text-xs">
                            <p className="font-semibold text-amber-400">
                                Do not share your private key!
                            </p>
                            <p className="leading-5 text-amber-200/90 text-[11px]">
                                Anyone who obtains this private key will have full, permanent control over this account and can steal your assets. Crypto support will never ask for it.
                            </p>
                        </div>
                    </div>

                    {/* Private Key Box */}
                    <div className="rounded-2xl border border-[#5E5E5E]/20 bg-black p-4">
                        <div className="flex items-center justify-between pb-2 border-b border-[#5E5E5E]/20">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5E5E5E]">
                                Private Key
                            </span>
                            <span className="text-[10px] text-[#5E5E5E]">
                                Hex Encoded
                            </span>
                        </div>

                        <div className="mt-3 rounded-xl border border-[#5E5E5E]/20 bg-black p-3.5">
                            <p className="break-all font-mono text-xs text-[#48E5C2] leading-6 select-all">
                                {privateKey || ''}
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="pt-2 space-y-2.5">
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#48E5C2] px-4 py-3 text-xs font-semibold text-black transition-opacity hover:opacity-90 active:scale-[0.99] cursor-pointer"
                        >
                            {copied ? (
                                <>
                                    <Check size={16} />
                                    <span>Copied to Clipboard</span>
                                </>
                            ) : (
                                <>
                                    <Copy size={16} />
                                    <span>Copy Private Key</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={onHide}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#5E5E5E]/30 bg-black px-4 py-2.5 text-xs font-medium text-[#5E5E5E] transition-colors hover:border-[#5E5E5E]/50 hover:text-[#FCFAF9] cursor-pointer"
                        >
                            <EyeOff size={15} />
                            <span>Done & Hide</span>
                        </button>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default PrivateKeyPage

