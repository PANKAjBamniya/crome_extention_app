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
        <header className="relative flex shrink-0 items-center justify-between px-4 pb-3 pt-4 border-b border-[#5E5E5E]/20 bg-black">
            <div
                onClick={onAccountClick}
                className="flex items-start gap-1 min-w-0 flex-col cursor-pointer group rounded-lg p-1 -m-1 transition-colors hover:bg-[#5E5E5E]/10"
                role="button"
                tabIndex={0}
                title="Manage accounts"
            >
                <div className="min-w-0 flex flex-col items-start">
                    <h1 className="text-sm font-semibold text-[#FCFAF9] truncate leading-tight flex gap-1.5 items-center">
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
                            className="text-[#5E5E5E] group-hover:text-[#48E5C2] transition-colors"
                        />
                    </h1>

                    <div className="mt-1 flex items-center gap-1.5">
                        <span
                            onClick={handleCopy}
                            className="font-mono text-[11px] text-[#5E5E5E] hover:text-[#FCFAF9] cursor-pointer transition-colors"
                            title="Click to copy full address"
                        >
                            {displayAddress}
                        </span>

                        <button
                            type="button"
                            onClick={handleCopy}
                            aria-label="Copy full wallet address"
                            className="flex items-center justify-center p-0.5 rounded text-[#5E5E5E] hover:text-[#48E5C2] transition-colors"
                            title={copied ? 'Copied!' : 'Copy full address'}
                        >
                            {copied ? (
                                <Check size={12} className="text-[#48E5C2]" />
                            ) : (
                                <Copy size={12} />
                            )}
                        </button>

                        {copied && (
                            <span className="text-[10px] font-medium text-[#48E5C2] animate-fade-in">
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
                    className="flex items-center gap-1.5 rounded-full border border-[#5E5E5E]/30 bg-black px-2.5 py-1 text-xs text-[#FCFAF9] hover:border-[#48E5C2] transition-colors cursor-pointer active:scale-95"
                >
                    {activeNetwork.icon ? (
                        <ImageComp
                            src={activeNetwork.icon}
                            alt={activeNetwork.name}
                            className="h-4 w-4 rounded-full object-cover shrink-0"
                            fallback={<span className="flex h-2 w-2 rounded-full bg-[#48E5C2]" />}
                        />
                    ) : (
                        <span className="flex h-2 w-2 rounded-full bg-[#48E5C2]" />
                    )}
                    <span className="font-medium text-[11px] max-w-[70px] truncate text-[#FCFAF9]">
                        {activeNetwork.symbol}
                    </span>
                    <ChevronDown size={13} className="text-[#5E5E5E]" />
                </button>

                {/* Settings icon */}
                {/* <button
                    type="button"
                    onClick={handleSettings}
                    aria-label="Settings"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5E5E5E] hover:text-[#FCFAF9] hover:bg-[#5E5E5E]/10 transition-colors"
                >
                    <Settings size={18} />
                </button> */}
            </div>
        </header>
    )
}

export default HomeHeader
