import React from 'react'
import type { AssetItem } from '../../types/token'
import AssetRow from './AssetRow'

interface AssetListProps {
    assets: AssetItem[]
    isLoading?: boolean
    showBalance?: boolean
    onDelete?: (tokenId: string) => void
    onAssetClick?: (asset: AssetItem) => void
    emptyMessage?: string
}

export const AssetList: React.FC<AssetListProps> = ({
    assets,
    isLoading = false,
    showBalance = true,
    onDelete,
    onAssetClick,
    emptyMessage = 'No assets found',
}) => {
    if (isLoading && assets.length === 0) {
        return (
            <div className="divide-y divide-[#5E5E5E]/15 py-1">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between py-3.5 px-2 animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-[#5E5E5E]/20" />
                            <div className="space-y-1.5">
                                <div className="h-3 w-20 rounded bg-[#5E5E5E]/20" />
                                <div className="h-2 w-10 rounded bg-[#5E5E5E]/15" />
                            </div>
                        </div>
                        <div className="space-y-1.5 text-right">
                            <div className="h-3 w-16 rounded bg-[#5E5E5E]/20 ml-auto" />
                            <div className="h-2 w-10 rounded bg-[#5E5E5E]/15 ml-auto" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (assets.length === 0) {
        return (
            <div className="py-8 text-center border border-[#5E5E5E]/20 rounded-xl bg-black/40">
                <p className="text-xs text-[#5E5E5E]">{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col">
            {assets.map((asset, index) => (
                <AssetRow
                    key={asset.id}
                    asset={asset}
                    showBalance={showBalance}
                    isLast={index === assets.length - 1}
                    onDelete={onDelete}
                    onClick={() => onAssetClick?.(asset)}
                />
            ))}
        </div>
    )
}

export default AssetList
