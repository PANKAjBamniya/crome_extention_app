import React, { useState } from 'react'
import { X, Search } from 'lucide-react'
import BottomSheet from '../../BottomSheet'
import ImageComp from '../../ImageComp'

export interface ReceiveAssetItem {
    id: string
    name: string
    symbol: string
    decimals: number
    logoUrl?: string
    isNative: boolean
    address?: string
}

interface SelectAssetSheetProps {
    isOpen: boolean
    onClose: () => void
    activeAsset: ReceiveAssetItem
    assets: ReceiveAssetItem[]
    onSelectAsset: (asset: ReceiveAssetItem) => void
}

export const SelectAssetSheet: React.FC<SelectAssetSheetProps> = ({
    isOpen,
    onClose,
    activeAsset,
    assets,
    onSelectAsset,
}) => {
    const [query, setQuery] = useState('')

    const filtered = assets.filter(
        (a) =>
            a.name.toLowerCase().includes(query.toLowerCase()) ||
            a.symbol.toLowerCase().includes(query.toLowerCase())
    )

    return (
        <BottomSheet visible={isOpen} onClose={onClose} closeOnBackdropPress={true}>
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between border-b border-[#5E5E5E]/30 pb-3 shrink-0">
                    <h2 className="text-base font-semibold text-[#FCFAF9]">Select Asset</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close assets sheet"
                        className="rounded-lg p-1 text-[#5E5E5E] hover:bg-[#5E5E5E]/10 hover:text-[#FCFAF9] transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {assets.length > 5 && (
                    <div className="mt-3 relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search asset..."
                            className="w-full rounded-xl border border-[#5E5E5E]/30 bg-black py-2 pl-8 pr-3 text-xs text-[#FCFAF9] placeholder-[#5E5E5E] outline-none focus:border-[#48E5C2]"
                        />
                        <Search
                            size={14}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5E5E5E]"
                        />
                    </div>
                )}

                <div className="my-3 flex-1 space-y-2 overflow-y-auto pr-0.5">
                    {filtered.length === 0 ? (
                        <div className="py-6 text-center text-xs text-[#5E5E5E]">
                            No assets found.
                        </div>
                    ) : (
                        filtered.map((asset) => {
                            const isSelected = asset.id === activeAsset.id

                            return (
                                <button
                                    key={asset.id}
                                    type="button"
                                    onClick={() => {
                                        onSelectAsset(asset)
                                        onClose()
                                    }}
                                    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all cursor-pointer ${isSelected
                                        ? 'border-[#48E5C2]/40 bg-[#48E5C2]/10'
                                        : 'border-[#5E5E5E]/20 bg-black hover:border-[#5E5E5E]/50 hover:bg-[#5E5E5E]/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden bg-[#5E5E5E]/20 text-[#FCFAF9]">
                                            {asset.logoUrl ? (
                                                <ImageComp
                                                    src={asset.logoUrl}
                                                    alt={asset.symbol}
                                                    className="h-8 w-8 rounded-full object-cover shrink-0"
                                                    fallback={
                                                        <span className="text-xs font-semibold">
                                                            {asset.symbol.slice(0, 3)}
                                                        </span>
                                                    }
                                                />
                                            ) : (
                                                <span className="text-xs font-semibold text-[#48E5C2]">
                                                    {asset.symbol.slice(0, 3)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-[#FCFAF9]">
                                                {asset.name}
                                            </p>
                                            <p className="text-xs text-[#5E5E5E]">
                                                {asset.symbol}
                                                {asset.isNative && ' • Native'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${isSelected
                                                ? 'border-[#48E5C2]'
                                                : 'border-[#5E5E5E]'
                                                }`}
                                        >
                                            {isSelected && (
                                                <div className="h-2.5 w-2.5 rounded-full bg-[#48E5C2]" />
                                            )}
                                        </div>
                                    </div>
                                </button>
                            )
                        })
                    )}
                </div>
            </div>
        </BottomSheet>
    )
}

export default SelectAssetSheet

