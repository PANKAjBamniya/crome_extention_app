import React from 'react'
import { X } from 'lucide-react'
import BottomSheet from '../../BottomSheet'
import { EVM_NETWORKS, type EVMNetwork } from '../../../config/networks'
import ImageComp from '../../ImageComp'

export type NetworkItem = EVMNetwork

interface SelectNetworkSheetProps {
    isOpen: boolean
    onClose: () => void
    activeNetwork: NetworkItem
    networks?: NetworkItem[]

    onSelectNetwork: (network: NetworkItem) => void
}

const SelectNetworkSheet: React.FC<SelectNetworkSheetProps> = ({
    isOpen,
    onClose,
    activeNetwork,
    networks = EVM_NETWORKS,
    onSelectNetwork,
}) => {
    return (
        <BottomSheet
            visible={isOpen}
            onClose={onClose}
            closeOnBackdropPress={true}
        >
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
                    <h2 className="text-base font-semibold text-white">
                        Select Network
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close networks sheet"
                        className="rounded-lg p-1 text-gray-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="my-3 flex-1 space-y-2 overflow-y-auto pr-0.5">
                    {networks.map((network) => {
                        const isSelected = network.id === activeNetwork.id

                        return (
                            <button
                                key={network.id || network.name}
                                type="button"
                                onClick={() => {
                                    onSelectNetwork(network)
                                    onClose()
                                }}
                                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all cursor-pointer ${isSelected
                                    ? 'border-[#C7F11D]/40 bg-[#C7F11D]/10'
                                    : 'border-white/5 bg-[#18191B] hover:border-white/20 hover:bg-white/[0.04]'
                                    }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden transition-colors ${!network.icon && isSelected
                                            ? 'bg-[#C7F11D] text-black font-bold'
                                            : 'bg-white/10 text-gray-300'
                                            }`}
                                    >
                                        <ImageComp
                                            src={network.icon}
                                            alt={network.name}
                                            className="h-8 w-8 rounded-full object-cover shrink-0"
                                            fallback={
                                                <span className="text-xs font-semibold">
                                                    {network.symbol.slice(0, 3)}
                                                </span>
                                            }
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-white">
                                            {network.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {network.symbol}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div
                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${isSelected
                                            ? 'border-[#C7F11D]'
                                            : 'border-gray-600'
                                            }`}
                                    >
                                        {isSelected && (
                                            <div className="h-2.5 w-2.5 rounded-full bg-[#C7F11D]" />
                                        )}
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>
        </BottomSheet>
    )
}

export default SelectNetworkSheet

