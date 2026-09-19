import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import {
    ChevronLeft,
    ChevronDown,
    Star,
    Share2,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Check,
} from 'lucide-react'
import type { AssetItem, Token } from '../../types/token'
import type { TokenDetails as TokenDetailsType, ChartPoint } from '../../types/tokenDetails'
import { buildTokenDetails } from '../../services/token/tokenDetailsService'
import { getTokenTransactions } from '../../services/blockchain/transactionService'
import { getActiveTokens } from '../../services/token/tokenStorage'
import { getAllCatalogTokens } from '../../services/token/tokenRegistry'
import { EVM_NETWORKS, type EVMNetwork, getNetworkByChainId } from '../../config/networks'
import { getActiveNetworkId, setActiveNetworkId } from '../../services/walletStorage'
import ImageComp from '../../components/ImageComp/ImageComp'
import TokenPriceChart from '../../components/chart/TokenPriceChart'
import TokenBuySection from '../../components/tokenDetails/TokenBuySection'
import TokenHoldingsTab from '../../components/tokenDetails/TokenHoldingsTab'
import TokenHistoryTab from '../../components/tokenDetails/TokenHistoryTab'
import TokenAboutTab from '../../components/tokenDetails/TokenAboutTab'
import SelectNetworkSheet from '../../components/sheets/SelectNetworkSheet/SelectNetworkSheet'

type DetailTab = 'holdings' | 'activity' | 'about' | 'staking'

export const TokenDetails: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const params = useParams<{ tokenId?: string }>()
    const buySectionRef = useRef<HTMLDivElement | null>(null)

    const [activeTab, setActiveTab] = useState<DetailTab>('holdings')
    const [tokenData, setTokenData] = useState<TokenDetailsType | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null)

    // Interactive header states
    const [isFavorite, setIsFavorite] = useState(false)
    const [showShareToast, setShowShareToast] = useState(false)
    const [isNetworkSheetOpen, setIsNetworkSheetOpen] = useState(false)
    const [activeNetwork, setActiveNetwork] = useState<EVMNetwork>(EVM_NETWORKS[0])

    useEffect(() => {
        getActiveNetworkId().then((savedId) => {
            const found = EVM_NETWORKS.find((n) => n.id === savedId)
            if (found) {
                setActiveNetwork(found)
            }
        })
    }, [])

    const [txLoading, setTxLoading] = useState(false)
    const [txError, setTxError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true

        const resolveToken = async () => {
            setIsLoading(true)

            const stateToken = (location.state as { token?: AssetItem | Token })?.token
            if (stateToken) {
                const built = buildTokenDetails(
                    stateToken,
                    'balance' in stateToken ? stateToken.balance : '0.00',
                    'value' in stateToken ? stateToken.value : '$0.00'
                )
                if (isMounted) {
                    setTokenData(built)
                    setIsLoading(false)
                }
                return
            }

            const targetId = params.tokenId
            if (targetId) {
                const nativeMatch = EVM_NETWORKS.find(
                    (n) => `native-${n.chainId}` === targetId || n.symbol.toLowerCase() === targetId.toLowerCase()
                )
                if (nativeMatch) {
                    const built = buildTokenDetails({
                        id: `native-${nativeMatch.chainId}`,
                        chainId: nativeMatch.chainId,
                        name: nativeMatch.nativeCurrency.name,
                        symbol: nativeMatch.nativeCurrency.symbol,
                        decimals: nativeMatch.nativeCurrency.decimals,
                        logoUrl: nativeMatch.icon,
                        address: '',
                        isCustom: false,
                        createdAt: 0,
                    } as Token)
                    if (isMounted) {
                        setTokenData(built)
                        setIsLoading(false)
                    }
                    return
                }

                const activeTokens = await getActiveTokens()
                const foundActive = activeTokens.find(
                    (t) => t.id === targetId || t.symbol.toLowerCase() === targetId.toLowerCase()
                )
                if (foundActive) {
                    const built = buildTokenDetails(foundActive)
                    if (isMounted) {
                        setTokenData(built)
                        setIsLoading(false)
                    }
                    return
                }

                const allCatalog = getAllCatalogTokens()
                const foundCatalog = allCatalog.find(
                    (t) => t.id === targetId || t.symbol.toLowerCase() === targetId.toLowerCase()
                )
                if (foundCatalog) {
                    const built = buildTokenDetails(foundCatalog)
                    if (isMounted) {
                        setTokenData(built)
                        setIsLoading(false)
                    }
                    return
                }
            }

            const defaultEth = EVM_NETWORKS[0]
            const builtDefault = buildTokenDetails({
                id: `native-${defaultEth.chainId}`,
                chainId: defaultEth.chainId,
                name: defaultEth.nativeCurrency.name,
                symbol: defaultEth.nativeCurrency.symbol,
                decimals: defaultEth.nativeCurrency.decimals,
                logoUrl: defaultEth.icon,
                address: '',
                isCustom: false,
                createdAt: 0,
            } as Token)

            if (isMounted) {
                setTokenData(builtDefault)
                setIsLoading(false)
            }
        }

        resolveToken()

        return () => {
            isMounted = false
        }
    }, [location.state, params.tokenId])

    useEffect(() => {
        if (!tokenData || activeTab !== 'activity') return

        let isMounted = true
        setTxLoading(true)
        setTxError(null)

        getTokenTransactions(tokenData.chainId, tokenData.symbol, tokenData.balance)
            .then((txs) => {
                if (isMounted) {
                    setTokenData((prev) => (prev ? { ...prev, transactions: txs } : prev))
                    setTxLoading(false)
                }
            })
            .catch(() => {
                if (isMounted) {
                    setTxError('Failed to load transaction history.')
                    setTxLoading(false)
                }
            })

        return () => {
            isMounted = false
        }
    }, [activeTab, tokenData?.id])

    const displayedPrice = useMemo(() => {
        if (!tokenData) return '$0.00'
        if (hoveredPoint) {
            return hoveredPoint.price >= 1
                ? `$${hoveredPoint.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : `$${hoveredPoint.price.toFixed(4)}`
        }
        return tokenData.priceInfo.formattedPrice
    }, [tokenData, hoveredPoint])

    const handleShare = async () => {
        if (!tokenData) return
        const text = `${tokenData.name} (${tokenData.symbol}) - Current Price: ${tokenData.priceInfo.formattedPrice} | ${tokenData.networkName}`
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `${tokenData.symbol} Details`,
                    text,
                })
            } else {
                await navigator.clipboard.writeText(text)
                setShowShareToast(true)
                setTimeout(() => setShowShareToast(false), 2200)
            }
        } catch {
            await navigator.clipboard.writeText(text)
            setShowShareToast(true)
            setTimeout(() => setShowShareToast(false), 2200)
        }
    }

    if (isLoading || !tokenData) {
        return (
            <div className="relative h-screen w-full bg-[#0B0F15] text-[#FCFAF9] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A222F] border-t-[#48E5C2]" />
                    <p className="text-xs text-[#8E9BAE]">Loading token details...</p>
                </div>
            </div>
        )
    }

    const isPositive = tokenData.priceInfo.isPositiveChange
    const networkDisplayName = activeNetwork?.name || tokenData.networkName || 'Sepolia Testnet'

    return (
        <div className="relative h-screen w-full overflow-hidden bg-[#0B0F15] text-[#FCFAF9]">
            <div className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[#48E5C2] opacity-[0.035] blur-[110px]" />

            <div className="relative mx-auto flex h-full w-full max-w-md flex-col">
                <header className="shrink-0 flex items-center justify-between px-4 pt-3 pb-2 z-10">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#232B3A] bg-[#161C26] text-[#FCFAF9] hover:bg-[#202735] transition-colors cursor-pointer"
                        aria-label="Back"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsNetworkSheetOpen(true)}
                        className="flex items-center gap-2 rounded-full border border-[#232B3A] bg-[#161C26] px-3.5 py-1.5 text-xs font-semibold text-[#FCFAF9] hover:border-[#48E5C2]/40 transition-colors cursor-pointer"
                    >
                        <span className="h-2 w-2 rounded-full bg-[#48E5C2] shadow-[0_0_8px_#48E5C2]" />
                        <span className="max-w-[140px] truncate">{networkDisplayName}</span>
                        <ChevronDown size={14} className="text-[#8E9BAE]" />
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsFavorite(!isFavorite)}
                            className={`flex h-9 w-9 items-center justify-center rounded-full border border-[#232B3A] bg-[#161C26] transition-colors cursor-pointer ${isFavorite ? 'text-[#48E5C2]' : 'text-[#8E9BAE] hover:text-[#FCFAF9]'
                                }`}
                            aria-label="Favorite"
                        >
                            <Star size={16} fill={isFavorite ? '#48E5C2' : 'none'} />
                        </button>

                        <button
                            type="button"
                            onClick={handleShare}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#232B3A] bg-[#161C26] text-[#8E9BAE] hover:text-[#FCFAF9] transition-colors cursor-pointer"
                            aria-label="Share"
                        >
                            <Share2 size={16} />
                        </button>
                    </div>
                </header>

                {showShareToast && (
                    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full border border-[#48E5C2]/40 bg-[#0D121A]/95 px-4 py-1.5 text-xs font-semibold text-[#48E5C2] shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                        <Check size={14} />
                        <span>Copied to clipboard!</span>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto px-4 pb-20 space-y-4 select-none">
                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#232B3A] bg-[#161C26] p-2 shadow-inner">
                                {tokenData.logoUrl ? (
                                    <ImageComp
                                        src={tokenData.logoUrl}
                                        alt={tokenData.symbol}
                                        size={32}
                                        className="rounded-full object-cover"
                                        fallback={
                                            <div className="text-sm font-bold text-[#48E5C2]">
                                                {tokenData.symbol.slice(0, 1)}
                                            </div>
                                        }
                                    />
                                ) : (
                                    <div className="text-sm font-bold text-[#48E5C2]">
                                        {tokenData.symbol.slice(0, 1)}
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl font-bold tracking-tight text-[#FCFAF9]">
                                        {tokenData.symbol}
                                    </h1>
                                    <span className="rounded border border-[#174845] bg-[#0F292B] px-2 py-0.5 text-[10px] font-semibold tracking-wider text-[#48E5C2]">
                                        {tokenData.tokenStandard || 'ERC-20'}
                                    </span>
                                </div>
                                <p className="text-xs text-[#8E9BAE] mt-0.5">
                                    {tokenData.name}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-full border border-[#232B3A] bg-[#161C26] px-3 py-1 text-xs font-medium text-[#8E9BAE]">
                            {tokenData.rank || 'Rank #2'}
                        </div>
                    </div>

                    <div className="flex items-end justify-between pt-1">
                        <div>
                            <div className="flex items-baseline font-mono text-3xl font-bold tracking-tight text-[#FCFAF9]">
                                <span className="text-2xl font-semibold mr-0.5">$</span>
                                <span>{displayedPrice.replace('$', '')}</span>
                            </div>

                            <div className="mt-1 flex items-center gap-2">
                                <div
                                    className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${isPositive
                                        ? 'border-[#174845] bg-[#0F292B] text-[#48E5C2]'
                                        : 'border-red-500/30 bg-red-500/10 text-red-400'
                                        }`}
                                >
                                    {isPositive ? (
                                        <ArrowUpRight size={13} className="text-[#48E5C2]" />
                                    ) : (
                                        <ArrowDownRight size={13} className="text-red-400" />
                                    )}
                                    <span>
                                        {tokenData.priceInfo.formattedPriceChange24h} (
                                        {isPositive ? '+' : ''}
                                        {tokenData.priceInfo.priceChangePercent24h.toFixed(2)}%)
                                    </span>
                                </div>
                                <span className="text-xs font-medium text-[#8E9BAE]">
                                    Past 24h
                                </span>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-[11px] font-medium text-[#8E9BAE]">
                                24h Range
                            </p>
                            <p className="font-mono text-xs font-bold text-[#FCFAF9] mt-0.5">
                                {tokenData.range24h || '$2,410 - $2,504'}
                            </p>
                        </div>
                    </div>

                    <div className="w-full">
                        <TokenPriceChart
                            data={tokenData.chartData}
                            symbol={tokenData.symbol}
                            isPositive={isPositive}
                            onHoverPoint={setHoveredPoint}
                        />
                    </div>

                    <div ref={buySectionRef} className="w-full">
                        <TokenBuySection
                            symbol={tokenData.symbol}
                            tokenPriceUsd={tokenData.priceInfo.currentPrice}
                            initialQuote={tokenData.buyQuote}
                            rateText={tokenData.rateText}
                        />
                    </div>

                    <div className="pt-2">
                        <div className="flex items-center justify-between border-b border-[#1A222F] px-1">
                            <button
                                type="button"
                                onClick={() => setActiveTab('holdings')}
                                className={`pb-2.5 text-xs font-semibold transition-all cursor-pointer ${activeTab === 'holdings'
                                    ? 'border-b-2 border-[#48E5C2] text-[#48E5C2]'
                                    : 'border-b-2 border-transparent text-[#8E9BAE] hover:text-[#FCFAF9]'
                                    }`}
                            >
                                Holdings
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('activity')}
                                className={`pb-2.5 text-xs font-semibold transition-all cursor-pointer ${activeTab === 'activity'
                                    ? 'border-b-2 border-[#48E5C2] text-[#48E5C2]'
                                    : 'border-b-2 border-transparent text-[#8E9BAE] hover:text-[#FCFAF9]'
                                    }`}
                            >
                                Activity
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('about')}
                                className={`pb-2.5 text-xs font-semibold transition-all cursor-pointer ${activeTab === 'about'
                                    ? 'border-b-2 border-[#48E5C2] text-[#48E5C2]'
                                    : 'border-b-2 border-transparent text-[#8E9BAE] hover:text-[#FCFAF9]'
                                    }`}
                            >
                                About {tokenData.symbol}
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('staking')}
                                className={`pb-2.5 text-xs font-semibold transition-all cursor-pointer ${activeTab === 'staking'
                                    ? 'border-b-2 border-[#48E5C2] text-[#48E5C2]'
                                    : 'border-b-2 border-transparent text-[#8E9BAE] hover:text-[#FCFAF9]'
                                    }`}
                            >
                                Staking
                            </button>
                        </div>

                        <div className="mt-4">
                            {activeTab === 'holdings' && (
                                <TokenHoldingsTab
                                    token={tokenData}
                                    onManage={() => navigate('/assets')}
                                    onStartStaking={() => setActiveTab('staking')}
                                />
                            )}

                            {activeTab === 'activity' && (
                                <TokenHistoryTab
                                    transactions={tokenData.transactions}
                                    isLoading={txLoading}
                                    error={txError}
                                    symbol={tokenData.symbol}
                                />
                            )}

                            {activeTab === 'about' && (
                                <TokenAboutTab token={tokenData} />
                            )}

                            {activeTab === 'staking' && (
                                <div className="space-y-4">
                                    <TokenHoldingsTab
                                        token={tokenData}
                                        onManage={() => navigate('/assets')}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <SelectNetworkSheet
                isOpen={isNetworkSheetOpen}
                onClose={() => setIsNetworkSheetOpen(false)}
                activeNetwork={activeNetwork}
                onSelectNetwork={(network) => {
                    setActiveNetwork(network)
                    setActiveNetworkId(network.id)
                    setIsNetworkSheetOpen(false)
                }}
            />
        </div>
    )
}

export default TokenDetails
