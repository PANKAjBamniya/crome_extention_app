import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import Back from '../../components/Back/Back'
import { EVM_NETWORKS, type EVMNetwork } from '../../config/networks'
import { getActiveNetworkId } from '../../services/walletStorage'
import { useAssets } from '../../hooks/useAssets'
import AssetList from '../../components/assets/AssetList'
import AddTokenButton from '../../components/assets/AddTokenButton'
import TokenSearch from '../../components/assets/TokenSearch'

export const Assets = () => {
    const navigate = useNavigate()
    const walletAddress = useSelector((state: RootState) => state.wallet.address)

    const [activeNetwork, setActiveNetwork] = useState<EVMNetwork>(EVM_NETWORKS[0])
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        getActiveNetworkId().then((id) => {
            if (id) {
                const found = EVM_NETWORKS.find((n) => n.id === id)
                if (found) {
                    setActiveNetwork(found)
                }
            }
        })
    }, [])

    const { assets, isLoading, deleteCustomToken } = useAssets(
        activeNetwork,
        walletAddress
    )

    const filteredAssets = assets.filter(
        (asset) =>
            asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (asset.networkName &&
                asset.networkName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black text-[#FCFAF9]">
            <div
                className="
                    pointer-events-none
                    absolute
                    left-1/2
                    top-1/2
                    h-[320px]
                    w-[320px]
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-[#48E5C2]
                    opacity-[0.035]
                    blur-[100px]
                "
            />

            <div className="relative mx-auto flex h-full w-full max-w-md flex-col">
                <main className="flex-1 overflow-y-auto px-5 pb-6">
                    <div className="pt-4">
                        <Back />
                    </div>

                    <div className="mt-4 mb-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-[#FCFAF9]">
                                Assets
                            </h1>
                            <p className="mt-0.5 text-xs text-[#5E5E5E]">
                                {activeNetwork.name}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate('/import-token')}
                            className="rounded-lg border border-[#48E5C2]/30 bg-[#48E5C2]/10 px-3 py-1.5 text-xs font-semibold text-[#48E5C2] hover:bg-[#48E5C2]/20 transition-colors"
                        >
                            + Add Token
                        </button>
                    </div>

                    <div className="mb-4">
                        <TokenSearch
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Filter assets..."
                        />
                    </div>

                    <AssetList
                        assets={filteredAssets}
                        isLoading={isLoading}
                        showBalance={true}
                        onDelete={deleteCustomToken}
                        onAssetClick={(asset) => navigate('/token-details', { state: { token: asset } })}
                        emptyMessage="No assets match your search."
                    />

                    <div className="mt-5">
                        <AddTokenButton
                            onClick={() => navigate('/import-token')}
                        />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Assets

