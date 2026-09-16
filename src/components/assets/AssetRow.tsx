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
            className={`group flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-white/[0.03] cursor-pointer ${!isLast ? 'border-b border-white/5' : ''
                }`}
        >
            <div className="flex items-center gap-3">
                {asset.logoUrl ? (
                    <ImageComp
                        src={asset.logoUrl}
                        alt={asset.symbol}
                        size={38}
                        className="rounded-full object-cover shrink-0"
                        fallback={
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#181818] text-xs font-bold text-[#C7F11D]">
                                {asset.symbol.slice(0, 1)}
                            </div>
                        }
                    />
                ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#181818] text-xs font-bold text-[#C7F11D]">
                        {asset.symbol.slice(0, 1)}
                    </div>
                )}

                <div>
                    <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-white">
                            {asset.name}
                        </p>
                        {asset.isCustom && (
                            <span className="rounded bg-[#C7F11D]/10 px-1 py-0.5 text-[8px] font-semibold text-[#C7F11D]">
                                Custom
                            </span>
                        )}
                    </div>

                    <p className="mt-0.5 text-[10px] text-gray-500">
                        {asset.symbol}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="text-right">
                    <p className="text-xs font-medium text-white">
                        {showBalance
                            ? `${asset.balance} ${asset.symbol}`
                            : '••••••'}
                    </p>

                    <p className="mt-0.5 text-[10px] text-gray-500">
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
                        className="ml-1 flex h-7 w-7 items-center justify-center rounded-md text-gray-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 transition-all"
                        title="Remove token from list"
                        aria-label={`Remove ${asset.name}`}
                    >
                        <Trash2 size={13} />
                    </button>
                )}
            </div>
        </div>
    )
}

export default AssetRow

