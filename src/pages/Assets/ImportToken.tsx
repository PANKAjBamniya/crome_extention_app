import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import Back from '../../components/Back/Back'
import { EVM_NETWORKS, type EVMNetwork } from '../../config/networks'
import { getActiveNetworkId, setActiveNetworkId } from '../../services/walletStorage'
import { getBuiltInTokens } from '../../services/token/tokenRegistry'
import { hasToken, saveToken } from '../../services/token/tokenStorage'
import { addCustomToken } from '../../store/slices/tokenSlice'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../store'
import type { Token } from '../../types/token'
import TokenSearch from '../../components/assets/TokenSearch'
import TokenImportForm from '../../components/assets/TokenImportForm'
import ImageComp from '../../components/ImageComp/ImageComp'

type TabType = 'search' | 'custom'

export const ImportToken = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    const [activeTab, setActiveTab] = useState<TabType>('custom')
    const [activeNetwork, setActiveNetwork] = useState<EVMNetwork>(EVM_NETWORKS[0])
    const [searchQuery, setSearchQuery] = useState('')
    const [addedAddresses, setAddedAddresses] = useState<Set<string>>(new Set())

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
            const builtIns = getBuiltInTokens(activeNetwork.chainId)
            const set = new Set<string>()
            for (const token of builtIns) {
                const exists = await hasToken(activeNetwork.chainId, token.address)
                if (exists) {
                    set.add(token.address.toLowerCase())
                }
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
            setAddedAddresses((prev) => new Set(prev).add(token.address.toLowerCase()))
            navigate('/wallet', { replace: true })
        } catch (err) {
            console.error('Failed to add built-in token:', err)
        }
    }

    const builtInTokens = getBuiltInTokens(activeNetwork.chainId)
    const filteredBuiltIns = builtInTokens.filter(
        (t) =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.address.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black text-white">
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
                    bg-[#C7F11D]
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
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Import Token
                        </h1>
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                            Search known tokens or import custom ERC-20 contract.
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="mb-5 flex rounded-xl border border-white/10 bg-[#121315] p-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab('custom')}
                            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${activeTab === 'custom'
                                ? 'bg-[#C7F11D] text-black font-semibold'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Custom Token
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('search')}
                            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${activeTab === 'search'
                                ? 'bg-[#C7F11D] text-black font-semibold'
                                : 'text-gray-400 hover:text-white'
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
                            <TokenSearch
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder="Search popular tokens..."
                            />

                            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0D0D0D]">
                                {filteredBuiltIns.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-gray-500">
                                        No popular tokens found for this search.
                                    </div>
                                ) : (
                                    filteredBuiltIns.map((token, index) => {
                                        const isAlreadyAdded = addedAddresses.has(
                                            token.address.toLowerCase()
                                        )

                                        return (
                                            <div
                                                key={token.id}
                                                className={`flex items-center justify-between px-4 py-3.5 ${index !== filteredBuiltIns.length - 1
                                                    ? 'border-b border-white/5'
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
                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#181818] text-xs font-bold text-[#C7F11D]">
                                                                    {token.symbol.slice(0, 1)}
                                                                </div>
                                                            }
                                                        />
                                                    ) : (
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#181818] text-xs font-bold text-[#C7F11D]">
                                                            {token.symbol.slice(0, 1)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-xs font-semibold text-white">
                                                            {token.name}
                                                        </p>
                                                        <p className="mt-0.5 text-[10px] text-gray-500">
                                                            {token.symbol} • Decimals: {token.decimals}
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    disabled={isAlreadyAdded}
                                                    onClick={() => handleAddBuiltIn(token)}
                                                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${isAlreadyAdded
                                                        ? 'bg-white/5 text-gray-500 cursor-default'
                                                        : 'bg-[#C7F11D] text-black hover:opacity-90 active:scale-[0.98]'
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
        </div>
    )
}

export default ImportToken

