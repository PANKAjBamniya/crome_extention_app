import React from 'react'
import { Trash2 } from 'lucide-react'
import type { AssetItem } from '../../types/token'
import ImageComp from '../ImageComp/ImageComp'

interface AssetRowProps {
    asset: AssetItem
    showBalance?: boolean
    isLast?: boolean
    onDelete?: (tokenId: string) => void
    onClick?: () => void
}

export const AssetRow: React.FC<AssetRowProps> = ({
    asset,
    showBalance = true,
    isLast = false,
    onDelete,
    onClick,
}) => {
    return (
        <div
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick?.()
                }
            }}
            className={`group flex w-full items-center justify-between py-3 text-left transition-colors hover:bg-[#48E5C2]/5 px-2 rounded-lg cursor-pointer ${!isLast ? 'border-b border-[#5E5E5E]/20' : ''
                }`}
        >
            <div className="flex items-center gap-3">
                {asset.logoUrl ? (
                    <ImageComp
                        src={asset.logoUrl}
                        alt={asset.symbol}
                        size={36}
                        className="rounded-full object-cover shrink-0"
                        fallback={
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#5E5E5E]/40 bg-black text-xs font-bold text-[#48E5C2]">
                                {asset.symbol.slice(0, 1)}
                            </div>
                        }
                    />
                ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#5E5E5E]/40 bg-black text-xs font-bold text-[#48E5C2]">
                        {asset.symbol.slice(0, 1)}
                    </div>
                )}

                <div>
                    <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-[#FCFAF9]">
                            {asset.name}
                        </p>
                        {asset.isCustom && (
                            <span className="rounded bg-[#48E5C2]/15 px-1 py-0.5 text-[8px] font-semibold text-[#48E5C2]">
                                Custom
                            </span>
                        )}
                    </div>

                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#5E5E5E]">
                        <span>{asset.symbol}</span>
                        {asset.networkName && (
                            <span>• {asset.networkName}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="text-right">
                    <p className="text-xs font-medium text-[#FCFAF9]">
                        {showBalance
                            ? `${asset.balance} ${asset.symbol}`
                            : '••••••'}
                    </p>

                    <p className="mt-0.5 text-[11px] text-[#5E5E5E]">
                        {showBalance ? asset.value : '••••'}
                    </p>
                </div>

                {asset.isCustom && onDelete && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete(asset.id)
                        }}
                        className="ml-1 flex h-6 w-6 items-center justify-center rounded text-[#5E5E5E] opacity-0 group-hover:opacity-100 hover:bg-[#48E5C2]/10 hover:text-[#48E5C2] transition-all"
                        title="Remove token from list"
                        aria-label={`Remove ${asset.name}`}
                    >
                        <Trash2 size={12} />
                    </button>
                )}
            </div>
        </div>
    )
}

export default AssetRow
