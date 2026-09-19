import React from 'react'
import { Link2, Sparkles } from 'lucide-react'
import type { TokenDetails } from '../../types/tokenDetails'
import ImageComp from '../ImageComp/ImageComp'

interface TokenHoldingsTabProps {
    token: TokenDetails
    onStartStaking?: () => void
    onManage?: () => void
}

export const TokenHoldingsTab: React.FC<TokenHoldingsTabProps> = ({
    token,
    onStartStaking,
    onManage,
}) => {
    const isPositive = token.priceInfo.isPositiveChange
    const staking = token.staking

    return (
        <div className="flex flex-col gap-5 select-none">
            {/* 1. MY BALANCE SECTION */}
            <div>
                <div className="flex items-center justify-between px-0.5 pb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E9BAE]">
                        MY BALANCE
                    </span>
                    <button
                        type="button"
                        onClick={onManage}
                        className="text-xs font-semibold text-[#48E5C2] hover:underline cursor-pointer"
                    >
                        Manage
                    </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-[#1A222F] bg-[#0D121A] p-3.5 shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#1E2738] bg-[#131924] p-1.5">
                            {token.logoUrl ? (
                                <ImageComp
                                    src={token.logoUrl}
                                    alt={token.symbol}
                                    size={28}
                                    className="rounded-full object-cover"
                                    fallback={
                                        <div className="text-xs font-bold text-[#48E5C2]">
                                            {token.symbol.slice(0, 1)}
                                        </div>
                                    }
                                />
                            ) : (
                                <div className="text-xs font-bold text-[#48E5C2]">
                                    {token.symbol.slice(0, 1)}
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-[#FCFAF9]">
                                {token.name}
                            </p>
                            <p className="mt-0.5 text-xs text-[#8E9BAE]">
                                {token.balance} {token.symbol}
                            </p>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="font-mono text-sm font-bold text-[#FCFAF9]">
                            {token.fiatBalance}
                        </p>
                        <p
                            className={`mt-0.5 text-xs font-semibold ${isPositive ? 'text-[#48E5C2]' : 'text-red-400'
                                }`}
                        >
                            {isPositive ? '+' : ''}
                            {token.priceInfo.priceChangePercent24h.toFixed(2)}%
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. POOL STAKING SECTION */}
            <div>
                <div className="flex items-center justify-between px-0.5 pb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E9BAE]">
                        POOL STAKING
                    </span>
                    <span className="rounded border border-[#174845] bg-[#0F292B] px-2 py-0.5 text-[10px] font-semibold text-[#48E5C2]">
                        Liquid APY
                    </span>
                </div>

                <div className="rounded-xl border border-[#1A222F] bg-[#0D121A] p-3.5 shadow-md">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#1E2738] bg-[#131924] text-[#48E5C2]">
                                <Link2 size={18} className="rotate-45" />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-[#FCFAF9]">
                                    {staking?.balance || `0 ${token.symbol} Staked`}
                                </p>
                                <p className="mt-0.5 text-xs font-semibold text-[#48E5C2]">
                                    {staking?.isSupported
                                        ? `Get up to ${staking.apr}`
                                        : 'Staking currently unavailable'}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onStartStaking}
                            disabled={!staking?.isSupported}
                            className="flex items-center gap-1.5 rounded-lg border border-[#1E524D] bg-[#0F292B] hover:bg-[#153a3d] px-3 py-1.5 text-xs font-semibold text-[#48E5C2] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                        >
                            <Sparkles size={12} />
                            <span>{staking?.buttonText || 'Get started'}</span>
                        </button>
                    </div>

                    <p className="mt-3 text-[11px] leading-relaxed text-[#8E9BAE]">
                        Stake your {token.symbol} to earn daily protocol rewards while retaining liquidity.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default TokenHoldingsTab
