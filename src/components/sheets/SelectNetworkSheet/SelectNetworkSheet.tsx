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
                <div className="flex items-center justify-between border-b border-[#5E5E5E]/30 pb-3 shrink-0">
                    <h2 className="text-base font-semibold text-[#FCFAF9]">
                        Select Network
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close networks sheet"
                        className="rounded-lg p-1 text-[#5E5E5E] hover:bg-[#5E5E5E]/10 hover:text-[#FCFAF9] transition-colors cursor-pointer"
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
                                    ? 'border-[#48E5C2]/40 bg-[#48E5C2]/10'
                                    : 'border-[#5E5E5E]/20 bg-black hover:border-[#5E5E5E]/50 hover:bg-[#5E5E5E]/5'
                                    }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden transition-colors ${!network.icon && isSelected
                                            ? 'bg-[#48E5C2] text-black font-bold'
                                            : 'bg-[#5E5E5E]/20 text-[#FCFAF9]'
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
                                        <p className="truncate text-sm font-medium text-[#FCFAF9]">
                                            {network.name}
                                        </p>
                                        <p className="text-xs text-[#5E5E5E]">
                                            {network.symbol}
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
                    })}
                </div>
            </div>
        </BottomSheet>
    )
}

export default SelectNetworkSheet

