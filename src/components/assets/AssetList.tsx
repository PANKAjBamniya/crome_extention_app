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
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0D0D0D] divide-y divide-white/5">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-white/5" />
                            <div className="space-y-1.5">
                                <div className="h-3 w-20 rounded bg-white/5" />
                                <div className="h-2 w-10 rounded bg-white/5" />
                            </div>
                        </div>
                        <div className="space-y-1.5 text-right">
                            <div className="h-3 w-16 rounded bg-white/5 ml-auto" />
                            <div className="h-2 w-10 rounded bg-white/5 ml-auto" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (assets.length === 0) {
        return (
            <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] p-8 text-center">
                <p className="text-xs text-gray-500">{emptyMessage}</p>
            </div>
        )
    }


    return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0D0D0D]">
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

