import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Copy, Check, ChevronDown } from 'lucide-react'
import ImageComp from '../ImageComp'
import { truncateEnd } from '../../utils/helpers'
import { EVM_NETWORKS, type EVMNetwork } from '../../config/networks'

interface HomeHeaderProps {
    address: string | null
    walletName?: string
    activeNetwork?: EVMNetwork
    onAccountClick?: () => void
    onNetworkClick?: () => void
    onSettingsClick?: () => void
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
    address,
    walletName = 'Account 1',
    activeNetwork = EVM_NETWORKS[0],
    onAccountClick,
    onNetworkClick,
    onSettingsClick,
}) => {
    const navigate = useNavigate()
    const [copied, setCopied] = useState(false)

    const displayAddress = address ? truncateEnd(address, 10) : '—'

    const handleCopy = useCallback(
        async (e: React.MouseEvent) => {
            e.stopPropagation()
            if (!address) return

            try {
                await navigator.clipboard.writeText(address)
                setCopied(true)
                setTimeout(() => {
                    setCopied(false)
                }, 1500)
            } catch (err) {
                console.error('Failed to copy address:', err)
            }
        },
        [address]
    )

    const handleSettings = useCallback(() => {
        if (onSettingsClick) {
            onSettingsClick()
        } else {
            navigate('/settings')
        }
    }, [navigate, onSettingsClick])

    return (
        <header className="relative flex shrink-0 items-center justify-between px-4 pb-3 pt-4 border-b border-white/5 bg-black/60 backdrop-blur-sm">
            <div
                onClick={onAccountClick}
                className="flex items-start gap-1 min-w-0 flex-col cursor-pointer group rounded-lg p-1 -m-1 transition-colors hover:bg-white/5"
                role="button"
                tabIndex={0}
                title="Manage accounts"
            >
                <div className="min-w-0 flex flex-col items-start">
                    <h1 className="text-sm font-semibold text-white truncate leading-tight flex gap-1.5 items-center">
                        <span>
                            👋 Hello,{' '}
                            {walletName
                                ? walletName.length > 7
                                    ? `${walletName.slice(0, 7)}...`
                                    : walletName
                                : 'Account 1'}
                        </span>

                        <ChevronDown
                            size={14}
                            className="text-gray-400 group-hover:text-[#C7F11D] transition-colors"
                        />
                    </h1>

                    <div className="mt-1 flex items-center gap-1.5">
                        <span
                            onClick={handleCopy}
                            className="font-mono text-[11px] text-gray-400 hover:text-white cursor-pointer transition-colors"
                            title="Click to copy full address"
                        >
                            {displayAddress}
                        </span>

                        <button
                            type="button"
                            onClick={handleCopy}
                            aria-label="Copy full wallet address"
                            className="flex items-center justify-center p-0.5 rounded text-gray-500 hover:text-[#C7F11D] transition-colors"
                            title={copied ? 'Copied!' : 'Copy full address'}
                        >
                            {copied ? (
                                <Check size={12} className="text-[#C7F11D]" />
                            ) : (
                                <Copy size={12} />
                            )}
                        </button>

                        {copied && (
                            <span className="text-[10px] font-medium text-[#C7F11D] animate-fade-in">
                                Copied
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {/* Network dropdown indicator */}
                <button
                    type="button"
                    onClick={onNetworkClick}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#18191B] px-2.5 py-1 text-xs text-gray-300 hover:border-white/20 hover:text-white transition-colors cursor-pointer active:scale-95"
                >
                    {activeNetwork.icon ? (
                        <ImageComp
                            src={activeNetwork.icon}
                            alt={activeNetwork.name}
                            className="h-4 w-4 rounded-full object-cover shrink-0"
                            fallback={<span className="flex h-2 w-2 rounded-full bg-[#C7F11D]" />}
                        />
                    ) : (
                        <span className="flex h-2 w-2 rounded-full bg-[#C7F11D]" />
                    )}
                    <span className="font-medium text-[11px] max-w-[70px] truncate">
                        {activeNetwork.symbol}
                    </span>
                    <ChevronDown size={13} className="text-gray-400" />
                </button>

                {/* Settings icon */}
                <button
                    type="button"
                    onClick={handleSettings}
                    aria-label="Settings"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                    <Settings size={18} />
                </button>
            </div>
        </header>
    )
}

export default HomeHeader

