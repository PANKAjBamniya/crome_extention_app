export type ChartTimeRange = '1H' | '1D' | '1W' | '1M' | '1Y' | 'All'

export interface ChartPoint {
    timestamp: number
    price: number
    formattedTime: string
}

export interface TokenPriceInfo {
    currentPrice: number
    formattedPrice: string
    priceChange24h: number
    formattedPriceChange24h: string
    priceChangePercent24h: number
    isPositiveChange: boolean
}

export interface TokenStakingInfo {
    isSupported: boolean
    title: string
    balance: string
    apr: string
    buttonText: string
    description?: string
}

export interface TokenBuyQuote {
    fiatCurrency: string
    fiatSymbol: string
    fiatAmount: number
    quickAmounts: number[]
    estimatedTokenAmount: string
    paymentMethod: string
    provider: string
}

export interface TokenTransactionItem {
    id: string
    type: 'send' | 'receive' | 'swap'
    amount: string
    symbol: string
    fiatValue: string
    toAddress?: string
    fromAddress?: string
    timestamp: number
    formattedDate: string
    status: 'completed' | 'pending' | 'failed'
    hash: string
    explorerUrl?: string
}

export interface TokenDetails {
    id: string
    symbol: string
    name: string
    logoUrl?: string
    decimals: number
    chainId: number
    networkName: string
    contractAddress?: string
    explorerUrl?: string
    isNative: boolean
    isCustom?: boolean
    balance: string
    fiatBalance: string
    priceInfo: TokenPriceInfo
    chartData: Record<ChartTimeRange, ChartPoint[]>
    staking?: TokenStakingInfo
    buyQuote?: TokenBuyQuote
    transactions: TokenTransactionItem[]
    description?: string
    rank?: string
    tokenStandard?: string
    range24h?: string
    rateText?: string
}

