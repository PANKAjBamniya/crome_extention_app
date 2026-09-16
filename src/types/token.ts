export interface Token {
    id: string
    chainId: number
    address: string
    name: string
    symbol: string
    decimals: number
    logoUrl?: string
    isCustom: boolean
    createdAt: number
}

export interface NativeAsset {
    id: string
    chainId: number
    name: string
    symbol: string
    decimals: number
    logoUrl?: string
}

export interface AssetItem {
    id: string
    chainId: number
    address?: string
    name: string
    symbol: string
    decimals: number
    balance: string
    rawBalance: bigint
    value: string
    logoUrl?: string
    isNative: boolean
    isCustom?: boolean
    isLoading?: boolean
    error?: string | null
}