import type { AssetItem, Token } from '../../types/token'
import type {
    TokenDetails,
    TokenPriceInfo,
    ChartTimeRange,
    ChartPoint,
    TokenStakingInfo,
    TokenBuyQuote,
    TokenTransactionItem,
} from '../../types/tokenDetails'
import { getNetworkByChainId, EVM_NETWORKS } from '../../config/networks'

/**
 * Baseline USD prices and 24h percentage movements for supported tokens.
 */
interface TokenMarketBaseline {
    price: number
    changePercent24h: number
    description: string
}

const MARKET_BASELINES: Record<string, TokenMarketBaseline> = {
    ETH: {
        price: 2482.64,
        changePercent24h: 1.83,
        description:
            'Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether is the native cryptocurrency of the platform.',
    },
    POL: {
        price: 0.428,
        changePercent24h: -0.65,
        description:
            'POL (formerly MATIC) is the native utility and governance token powering the Polygon ecosystem and next-generation aggregated blockchains.',
    },
    MATIC: {
        price: 0.428,
        changePercent24h: -0.65,
        description:
            'Polygon is a decentralized platform that enables Ethereum scaling and infrastructure development.',
    },
    BNB: {
        price: 582.4,
        changePercent24h: 2.14,
        description:
            'BNB powers the BNB Chain ecosystem and is used for gas fees, staking, and decentralized applications.',
    },
    BTC: {
        price: 64120.0,
        changePercent24h: 1.45,
        description:
            'Bitcoin is the first decentralized digital currency, enabling peer-to-peer transfers without intermediaries.',
    },
    USDT: {
        price: 1.0,
        changePercent24h: 0.02,
        description:
            'Tether (USDT) is a fiat-collateralized stablecoin pegged 1:1 to the US Dollar, issued by Tether Limited.',
    },
    USDC: {
        price: 1.0,
        changePercent24h: -0.01,
        description:
            'USD Coin (USDC) is a fully reserved digital stablecoin pegged to the United States dollar, managed by Centre consortium.',
    },
    DAI: {
        price: 1.0,
        changePercent24h: 0.01,
        description:
            'Dai is an algorithmic, collateral-backed decentralized cryptocurrency soft-pegged to the US Dollar by MakerDAO.',
    },
    LINK: {
        price: 12.85,
        changePercent24h: 3.25,
        description:
            'Chainlink is a decentralized blockchain oracle network built on Ethereum, connecting smart contracts with real-world data.',
    },
    BUSD: {
        price: 1.0,
        changePercent24h: 0.0,
        description:
            'Binance USD is a 1:1 USD-backed stablecoin approved by the NYDFS and issued in partnership with Paxos.',
    },
}

/**
 * Deterministic pseudorandom generator based on seed to keep chart shapes smooth and stable.
 */
const pseudoRandom = (seed: number): number => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
}

/**
 * Generate chart points for a specific time range.
 */
export const generateChartPoints = (
    basePrice: number,
    range: ChartTimeRange,
    changePercent: number
): ChartPoint[] => {
    const now = Date.now()
    const points: ChartPoint[] = []

    let count: number
    let stepMs: number

    switch (range) {
        case '1H':
            count = 12
            stepMs = (60 * 60 * 1000) / count
            break
        case '1D':
            count = 24
            stepMs = (24 * 60 * 60 * 1000) / count
            break
        case '1W':
            count = 21
            stepMs = (7 * 24 * 60 * 60 * 1000) / count
            break
        case '1M':
            count = 30
            stepMs = (30 * 24 * 60 * 60 * 1000) / count
            break
        case '1Y':
            count = 52
            stepMs = (365 * 24 * 60 * 60 * 1000) / count
            break
        case 'All':
        default:
            count = 40
            stepMs = (3 * 365 * 24 * 60 * 60 * 1000) / count
            break
    }

    const startPrice = basePrice * (1 - changePercent / 100)
    const priceDiff = basePrice - startPrice

    for (let i = 0; i < count; i++) {
        const timestamp = now - (count - 1 - i) * stepMs
        const progress = i / (count - 1)

        // Add natural harmonic oscillation
        const wave = Math.sin(progress * Math.PI * 3.5) * (basePrice * 0.012)
        const noise = (pseudoRandom(timestamp) - 0.5) * (basePrice * 0.008)

        let pointPrice = startPrice + priceDiff * progress + wave + noise
        if (i === count - 1) {
            pointPrice = basePrice
        }

        const date = new Date(timestamp)
        let formattedTime = ''
        if (range === '1H' || range === '1D') {
            formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } else if (range === '1W' || range === '1M') {
            formattedTime = date.toLocaleDateString([], { month: 'short', day: 'numeric' })
        } else {
            formattedTime = date.toLocaleDateString([], { month: 'short', year: '2-digit' })
        }

        points.push({
            timestamp,
            price: Math.max(0.0001, pointPrice),
            formattedTime,
        })
    }

    return points
}

/**
 * Resolves price info for a given token symbol.
 */
export const getTokenPriceInfo = (symbol: string): TokenPriceInfo => {
    const sym = symbol.toUpperCase()
    const baseline = MARKET_BASELINES[sym] || {
        price: 1.0,
        changePercent24h: 0.0,
        description: `${symbol} digital asset on EVM blockchain.`,
    }

    const currentPrice = baseline.price
    const priceChangePercent24h = baseline.changePercent24h
    const priceChange24h = (currentPrice * priceChangePercent24h) / 100
    const isPositiveChange = priceChangePercent24h >= 0

    const formattedPrice = currentPrice >= 1
        ? `$${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : `$${currentPrice.toFixed(4)}`

    const formattedPriceChange24h = `${isPositiveChange ? '+' : '-'}$${Math.abs(priceChange24h).toFixed(2)}`

    return {
        currentPrice,
        formattedPrice,
        priceChange24h,
        formattedPriceChange24h,
        priceChangePercent24h,
        isPositiveChange,
    }
}

/**
 * Returns dynamic staking configuration for supported tokens.
 */
export const getTokenStakingInfo = (
    symbol: string,
    chainId: number,
    isNative: boolean
): TokenStakingInfo | undefined => {
    const sym = symbol.toUpperCase()

    if (isNative && (sym === 'ETH' || chainId === 1)) {
        return {
            isSupported: true,
            title: 'Pool staking',
            balance: '0 ETH',
            apr: 'Get up to 2.58% APR',
            buttonText: 'Get started',
            description: 'Stake your ETH to earn daily rewards while securing the Ethereum network.',
        }
    }

    if (isNative && (sym === 'POL' || sym === 'MATIC' || chainId === 137)) {
        return {
            isSupported: true,
            title: 'Polygon Staking',
            balance: `0 ${symbol}`,
            apr: 'Get up to 4.20% APR',
            buttonText: 'Stake Now',
            description: 'Participate in network consensus and earn staking yields on Polygon.',
        }
    }

    if (isNative && (sym === 'BNB' || chainId === 56)) {
        return {
            isSupported: true,
            title: 'BNB Pool Staking',
            balance: '0 BNB',
            apr: 'Get up to 3.85% APR',
            buttonText: 'Start Staking',
            description: 'Delegate BNB to trusted validators to receive regular block rewards.',
        }
    }

    return {
        isSupported: false,
        title: 'Staking Unavailable',
        balance: `0 ${symbol}`,
        apr: '0.00% APR',
        buttonText: 'Not Supported',
        description: 'Staking is not currently supported for this asset on this network.',
    }
}

/**
 * Generate buy quote based on local currency (INR) and current token price.
 */
export const getTokenBuyQuote = (
    symbol: string,
    tokenPriceUsd: number
): TokenBuyQuote => {
    const usdToInrRate = 83.5
    const tokenPriceInr = Math.max(1, tokenPriceUsd * usdToInrRate)

    const defaultInrAmount = 3830
    const quickAmounts = [1900, 2900, 5700, 9600]

    const estimatedTokens = defaultInrAmount / tokenPriceInr
    const formattedTokenEstimate = estimatedTokens >= 1
        ? estimatedTokens.toFixed(4)
        : estimatedTokens.toFixed(6)

    return {
        fiatCurrency: 'INR',
        fiatSymbol: '₹',
        fiatAmount: defaultInrAmount,
        quickAmounts,
        estimatedTokenAmount: `Buying ${formattedTokenEstimate} ${symbol}`,
        paymentMethod: 'Bank Transfer',
        provider: 'Swapped.com',
    }
}

/**
 * Build the full TokenDetails object from an AssetItem or Token.
 */
export const buildTokenDetails = (
    asset: AssetItem | Token,
    userBalance = '0.00',
    fiatBalance = '$0.00'
): TokenDetails => {
    const symbol = asset.symbol || 'TOKEN'
    const name = asset.name || symbol
    const chainId = asset.chainId || 1
    const network = getNetworkByChainId(chainId) || EVM_NETWORKS[0]
    const isNative = 'isNative' in asset ? Boolean(asset.isNative) : !asset.address

    const priceInfo = getTokenPriceInfo(symbol)

    // Build chart data across all 6 time ranges
    const chartData: Record<ChartTimeRange, ChartPoint[]> = {
        '1H': generateChartPoints(priceInfo.currentPrice, '1H', 0.4),
        '1D': generateChartPoints(priceInfo.currentPrice, '1D', priceInfo.priceChangePercent24h),
        '1W': generateChartPoints(priceInfo.currentPrice, '1W', priceInfo.priceChangePercent24h * 1.8),
        '1M': generateChartPoints(priceInfo.currentPrice, '1M', priceInfo.priceChangePercent24h * 2.5),
        '1Y': generateChartPoints(priceInfo.currentPrice, '1Y', 24.5),
        'All': generateChartPoints(priceInfo.currentPrice, 'All', 85.0),
    }

    const staking = getTokenStakingInfo(symbol, chainId, isNative)
    const buyQuote = getTokenBuyQuote(symbol, priceInfo.currentPrice)

    const contractAddress = asset.address || undefined
    const explorerUrl = contractAddress
        ? `${network.explorerUrl}/token/${contractAddress}`
        : `${network.explorerUrl}`

    const description = MARKET_BASELINES[symbol.toUpperCase()]?.description ||
        `${name} (${symbol}) is a cryptographic token deployed on the ${network.name} network.`

    // Calculate real fiat balance if user has token balance
    const numBalance = parseFloat(userBalance.replace(/[^0-9.-]+/g, '')) || 0
    const calculatedFiat = numBalance > 0
        ? `$${(numBalance * priceInfo.currentPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : fiatBalance

    // Dynamic Rank lookup
    const rankMap: Record<string, string> = {
        BTC: 'Rank #1',
        ETH: 'Rank #2',
        USDT: 'Rank #3',
        BNB: 'Rank #4',
        SOL: 'Rank #5',
        USDC: 'Rank #6',
        POL: 'Rank #15',
        MATIC: 'Rank #15',
        DAI: 'Rank #18',
        LINK: 'Rank #19',
        BUSD: 'Rank #24',
    }
    const rank = rankMap[symbol.toUpperCase()] || 'Rank #50+'

    // Token standard
    const tokenStandard = chainId === 56 ? 'BEP-20' : 'ERC-20'

    // 24h Range calculation
    const min24h = priceInfo.currentPrice * 0.971
    const max24h = priceInfo.currentPrice * 1.0087
    const formatRangeVal = (val: number) =>
        val >= 100
            ? `$${Math.round(val).toLocaleString()}`
            : `$${val.toFixed(2)}`
    const range24h = `${formatRangeVal(min24h)} - ${formatRangeVal(max24h)}`

    const rateText = `Rate: 1 ${symbol} ≈ $${priceInfo.currentPrice >= 1 ? Math.round(priceInfo.currentPrice).toLocaleString() : priceInfo.currentPrice.toFixed(4)}`

    return {
        id: asset.id,
        symbol,
        name,
        logoUrl: asset.logoUrl,
        decimals: asset.decimals || 18,
        chainId,
        networkName: network.name,
        contractAddress,
        explorerUrl,
        isNative,
        isCustom: asset.isCustom,
        balance: userBalance,
        fiatBalance: calculatedFiat,
        priceInfo,
        chartData,
        staking,
        buyQuote,
        transactions: [], // Initially empty, handled by transaction service / hook
        description,
        rank,
        tokenStandard,
        range24h,
        rateText,
    }
}

