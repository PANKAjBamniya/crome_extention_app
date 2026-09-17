import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown } from 'lucide-react'
import Back from '../../components/Back/Back'
import { EVM_NETWORKS, type EVMNetwork } from '../../config/networks'
import { getActiveNetworkId, setActiveNetworkId } from '../../services/walletStorage'
import { getCatalogTokens, getAllCatalogTokens } from '../../services/token/tokenRegistry'
import { getActiveTokens, saveToken } from '../../services/token/tokenStorage'
import { createTokenId } from '../../utils/token/normalizeToken'
import { addCustomToken } from '../../store/slices/tokenSlice'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../store'
import type { Token } from '../../types/token'
import TokenSearch from '../../components/assets/TokenSearch'
import TokenImportForm from '../../components/assets/TokenImportForm'
import ImageComp from '../../components/ImageComp/ImageComp'
import SelectNetworkSheet from '../../components/sheets/SelectNetworkSheet/SelectNetworkSheet'

type TabType = 'custom' | 'search'

export const ImportToken = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    const [activeTab, setActiveTab] = useState<TabType>('custom')
    const [activeNetwork, setActiveNetwork] = useState<EVMNetwork>(EVM_NETWORKS[0])
    const [searchQuery, setSearchQuery] = useState('')
    const [addedAddresses, setAddedAddresses] = useState<Set<string>>(new Set())
    const [isNetworkSheetOpen, setIsNetworkSheetOpen] = useState(false)

    // Load active network from storage
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

    // Refresh set of already added tokens for the search tab
    useEffect(() => {
        const checkAdded = async () => {
            const activeTokens = await getActiveTokens()
            const set = new Set<string>()
            for (const token of activeTokens) {
                set.add(createTokenId(token.chainId, token.address))
            }
            setAddedAddresses(set)
        }
        checkAdded()
    }, [activeNetwork.chainId])

    const handleSelectNetwork = (net: EVMNetwork) => {
        setActiveNetwork(net)
        setActiveNetworkId(net.id)
    }

    const handleImportSuccess = (_token: Token) => {
        navigate('/wallet', { replace: true })
    }

    const handleAddBuiltIn = async (token: Token) => {
        try {
            await saveToken(token)
            dispatch(addCustomToken(token))
            setAddedAddresses((prev) =>
                new Set(prev).add(createTokenId(token.chainId, token.address))
            )
            navigate('/wallet', { replace: true })
        } catch (err) {
            console.error('Failed to add catalog token:', err)
        }
    }

    // If searching, search across full catalog; otherwise show active network's catalog
    const baseCatalog = searchQuery.trim()
        ? getAllCatalogTokens()
        : getCatalogTokens(activeNetwork.chainId)

    const filteredCatalog = baseCatalog.filter(
        (t) =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.address.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black text-[#FCFAF9]">
            {/* Background Glow */}
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

                    <div className="mt-4 mb-5">
                        <h1 className="text-2xl font-semibold tracking-tight text-[#FCFAF9]">
                            Import Token
                        </h1>
                        <p className="mt-1 text-xs leading-5 text-[#5E5E5E]">
                            Search known tokens or import custom ERC-20 contract.
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="mb-5 flex rounded-xl border border-[#5E5E5E]/20 bg-black p-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab('custom')}
                            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${activeTab === 'custom'
                                ? 'bg-[#48E5C2] text-black font-semibold'
                                : 'text-[#5E5E5E] hover:text-[#FCFAF9]'
                                }`}
                        >
                            Custom Token
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('search')}
                            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${activeTab === 'search'
                                ? 'bg-[#48E5C2] text-black font-semibold'
                                : 'text-[#5E5E5E] hover:text-[#FCFAF9]'
                                }`}
                        >
                            Popular Tokens
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'custom' ? (
                        <TokenImportForm
                            activeNetwork={activeNetwork}
                            networks={EVM_NETWORKS}
                            onSelectNetwork={handleSelectNetwork}
                            onImportSuccess={handleImportSuccess}
                            onCancel={() => navigate(-1)}
                        />
                    ) : (
                        <div className="flex flex-col gap-4">
                            {/* Network Selector for Popular Tokens */}
                            <div className="flex items-center justify-between rounded-xl border border-[#5E5E5E]/20 bg-black px-3.5 py-2.5 text-xs text-[#FCFAF9]">
                                <div className="flex items-center gap-2.5">
                                    <ImageComp
                                        src={activeNetwork.icon}
                                        alt={activeNetwork.name}
                                        size={20}
                                        className="rounded-full object-cover"
                                        fallback={
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black border border-[#5E5E5E]/30 text-[9px] font-bold text-[#48E5C2]">
                                                {activeNetwork.symbol.slice(0, 1)}
                                            </div>
                                        }
                                    />
                                    <span className="font-medium">
                                        {activeNetwork.name}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsNetworkSheetOpen(true)}
                                    className="flex items-center gap-1 text-xs text-[#48E5C2] hover:underline cursor-pointer"
                                >
                                    <span>Switch</span>
                                    <ChevronDown size={13} />
                                </button>
                            </div>

                            <TokenSearch
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder="Search popular tokens..."
                            />

                            <div className="overflow-hidden rounded-2xl border border-[#5E5E5E]/20 bg-black">
                                {filteredCatalog.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-[#5E5E5E]">
                                        No popular tokens found for this search.
                                    </div>
                                ) : (
                                    filteredCatalog.map((token, index) => {
                                        const isAlreadyAdded = addedAddresses.has(
                                            createTokenId(token.chainId, token.address)
                                        )

                                        return (
                                            <div
                                                key={token.id}
                                                className={`flex items-center justify-between px-4 py-3.5 ${index !== filteredCatalog.length - 1
                                                    ? 'border-b border-[#5E5E5E]/15'
                                                    : ''
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {token.logoUrl ? (
                                                        <ImageComp
                                                            src={token.logoUrl}
                                                            alt={token.symbol}
                                                            size={36}
                                                            className="rounded-full object-cover shrink-0"
                                                            fallback={
                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black border border-[#5E5E5E]/30 text-xs font-bold text-[#48E5C2]">
                                                                    {token.symbol.slice(0, 1)}
                                                                </div>
                                                            }
                                                        />
                                                    ) : (
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black border border-[#5E5E5E]/30 text-xs font-bold text-[#48E5C2]">
                                                            {token.symbol.slice(0, 1)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-xs font-semibold text-[#FCFAF9]">
                                                            {token.name}
                                                        </p>
                                                        <p className="mt-0.5 text-[10px] text-[#5E5E5E]">
                                                            {token.symbol} • Decimals: {token.decimals}
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    disabled={isAlreadyAdded}
                                                    onClick={() => handleAddBuiltIn(token)}
                                                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${isAlreadyAdded
                                                        ? 'bg-[#5E5E5E]/10 text-[#5E5E5E] cursor-default'
                                                        : 'bg-[#48E5C2] text-black hover:opacity-90 active:scale-[0.98] cursor-pointer'
                                                        }`}
                                                >
                                                    {isAlreadyAdded ? (
                                                        <span className="flex items-center gap-1">
                                                            <Check size={12} /> Added
                                                        </span>
                                                    ) : (
                                                        'Add'
                                                    )}
                                                </button>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <SelectNetworkSheet
                isOpen={isNetworkSheetOpen}
                onClose={() => setIsNetworkSheetOpen(false)}
                activeNetwork={activeNetwork}
                networks={EVM_NETWORKS}
                onSelectNetwork={(net) => {
                    handleSelectNetwork(net)
                    setIsNetworkSheetOpen(false)
                }}
            />
        </div>
    )
}

export default ImportToken

