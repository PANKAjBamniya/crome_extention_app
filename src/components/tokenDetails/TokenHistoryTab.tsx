import React from 'react'
import { ArrowDownLeft, ArrowUpRight, Repeat, ExternalLink, Clock } from 'lucide-react'
import type { TokenTransactionItem } from '../../types/tokenDetails'

interface TokenHistoryTabProps {
    transactions: TokenTransactionItem[]
    isLoading: boolean
    error: string | null
    symbol: string
}

export const TokenHistoryTab: React.FC<TokenHistoryTabProps> = ({
    transactions,
    isLoading,
    error,
    symbol,
}) => {
    if (isLoading) {
        return (
            <div className="space-y-2.5 py-1">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between rounded-xl border border-[#1A222F] bg-[#0D121A] p-3 animate-pulse"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-[#131924]" />
                            <div className="space-y-1.5">
                                <div className="h-3 w-20 rounded bg-[#1A222F]" />
                                <div className="h-2 w-14 rounded bg-[#1A222F]" />
                            </div>
                        </div>
                        <div className="space-y-1.5 text-right">
                            <div className="h-3 w-16 rounded bg-[#1A222F] ml-auto" />
                            <div className="h-2 w-10 rounded bg-[#1A222F] ml-auto" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-500/20 bg-[#0D121A] p-6 text-center">
                <p className="text-xs text-red-400">{error}</p>
            </div>
        )
    }

    if (!transactions || transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-[#1A222F] bg-[#0D121A] py-10 px-4 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#1E2738] bg-[#131924] text-[#8E9BAE] mb-3">
                    <Clock size={20} />
                </div>
                <h4 className="text-sm font-semibold text-[#FCFAF9]">
                    No Transactions Yet
                </h4>
                <p className="mt-1 text-xs text-[#8E9BAE] max-w-xs">
                    Your recent {symbol} transfers, swaps, and interactions will show up here.
                </p>
            </div>
        )
    }

    const renderIcon = (type: TokenTransactionItem['type']) => {
        switch (type) {
            case 'receive':
                return <ArrowDownLeft size={16} className="text-[#48E5C2]" />
            case 'send':
                return <ArrowUpRight size={16} className="text-[#FCFAF9]" />
            case 'swap':
            default:
                return <Repeat size={16} className="text-[#48E5C2]" />
        }
    }

    return (
        <div className="space-y-2">
            {transactions.map((tx) => (
                <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-xl border border-[#1A222F] bg-[#0D121A] p-3 transition-colors hover:border-[#232D3F]"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1E2738] bg-[#131924]">
                            {renderIcon(tx.type)}
                        </div>

                        <div>
                            <p className="text-xs font-semibold capitalize text-[#FCFAF9]">
                                {tx.type} {tx.symbol}
                            </p>
                            <p className="mt-0.5 text-[10px] text-[#8E9BAE]">
                                {tx.formattedDate}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="text-right">
                            <p className="font-mono text-xs font-semibold text-[#FCFAF9]">
                                {tx.type === 'send' ? '-' : '+'}
                                {tx.amount} {tx.symbol}
                            </p>
                            <p className="mt-0.5 text-[10px] text-[#8E9BAE]">
                                {tx.fiatValue}
                            </p>
                        </div>

                        {tx.explorerUrl && (
                            <a
                                href={tx.explorerUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg p-1 text-[#8E9BAE] hover:text-[#48E5C2] transition-colors"
                                title="View on Explorer"
                            >
                                <ExternalLink size={14} />
                            </a>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default TokenHistoryTab
