import { useState, useEffect, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import type { EVMNetwork } from '../config/networks'
import { getNetworkByChainId, EVM_NETWORKS } from '../config/networks'
import type { AssetItem, Token } from '../types/token'
import { getEVMClient } from '../services/blockchain/evmClient'
import { getTokenBalance } from '../services/token/erc20'
import {
    getActiveTokens as getStoredActiveTokens,
    removeActiveToken as removeStoredToken,
    saveActiveToken as saveStoredToken,
} from '../services/token/tokenStorage'
import { resolveTokenLogo } from '../services/token/tokenLogoService'
import {
    setCustomTokens,
    removeCustomToken,
    addCustomToken,
} from '../store/slices/tokenSlice'
import { formatTokenAmount } from '../utils/token/formatTokenAmount'

export interface UseAssetsResult {
    assets: AssetItem[]
    isLoading: boolean
    nativeBalance: string
    refetch: () => Promise<void>
    deleteCustomToken: (tokenId: string) => Promise<void>
}

export const useAssets = (
    network: EVMNetwork,
    walletAddress: string | null
): UseAssetsResult => {
    const dispatch = useDispatch<AppDispatch>()
    const customTokens = useSelector((state: RootState) => state.tokens.customTokens)
    const [assets, setAssets] = useState<AssetItem[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [nativeBalance, setNativeBalance] = useState<string>('0.00')

    const networkRef = useRef(network)
    networkRef.current = network

    const walletAddressRef = useRef(walletAddress)
    walletAddressRef.current = walletAddress

    useEffect(() => {
        let isMounted = true
        getStoredActiveTokens().then((tokens) => {
            if (isMounted) {
                dispatch(setCustomTokens(tokens))
            }
        })
        return () => {
            isMounted = false
        }
    }, [dispatch])

    const fetchAllAssets = useCallback(async () => {
        const currentNetwork = networkRef.current
        const currentAddress = walletAddressRef.current

        if (!currentAddress) {
            setAssets([])
            setNativeBalance('0.00')
            setIsLoading(false)
            return
        }

        setIsLoading(true)

        try {
            // User explicitly imported tokens from storage
            const allTokens: Token[] = await getStoredActiveTokens()

            // 1. Fetch Native Balances for each network in EVM_NETWORKS
            const nativePromises = EVM_NETWORKS.map(async (net) => {
                try {
                    const client = getEVMClient(net)
                    const raw = await client.getBalance({
                        address: currentAddress as `0x${string}`,
                    })
                    const formatted = formatTokenAmount(
                        raw,
                        net.nativeCurrency.decimals
                    )
                    return {
                        id: `native-${net.chainId}`,
                        chainId: net.chainId,
                        name: net.nativeCurrency.name,
                        symbol: net.nativeCurrency.symbol,
                        decimals: net.nativeCurrency.decimals,
                        balance: formatted,
                        rawBalance: raw,
                        value: '$0.00',
                        logoUrl: net.icon,
                        networkName: net.name,
                        networkIcon: net.icon,
                        isNative: true,
                        isCustom: false,
                        isLoading: false,
                        error: null,
                    } as AssetItem
                } catch (err) {
                    console.error(`Failed to fetch native balance for ${net.name}:`, err)
                    return {
                        id: `native-${net.chainId}`,
                        chainId: net.chainId,
                        name: net.nativeCurrency.name,
                        symbol: net.nativeCurrency.symbol,
                        decimals: net.nativeCurrency.decimals,
                        balance: '0.00',
                        rawBalance: 0n,
                        value: '$0.00',
                        logoUrl: net.icon,
                        networkName: net.name,
                        networkIcon: net.icon,
                        isNative: true,
                        isCustom: false,
                        isLoading: false,
                        error: 'Failed to fetch balance',
                    } as AssetItem
                }
            })

            // 2. Fetch ERC-20 Balances concurrently using each token's chainId
            const tokenPromises = allTokens.map(async (token) => {
                const tokenNetwork = getNetworkByChainId(token.chainId)
                const networkName = tokenNetwork ? tokenNetwork.name : `Chain ${token.chainId}`

                let resolvedLogo = token.logoUrl
                if (!resolvedLogo) {
                    try {
                        resolvedLogo = await resolveTokenLogo({
                            chainId: token.chainId,
                            address: token.address,
                        })
                        if (resolvedLogo && token.isCustom) {
                            const updated = { ...token, logoUrl: resolvedLogo }
                            saveStoredToken(updated).catch(() => { })
                            dispatch(addCustomToken(updated))
                        }
                    } catch {
                        // ignore
                    }
                }

                try {
                    const networkToUse = tokenNetwork || currentNetwork
                    const raw = await getTokenBalance(
                        networkToUse,
                        token.address,
                        currentAddress
                    )
                    const formatted = formatTokenAmount(raw, token.decimals)

                    return {
                        id: token.id,
                        chainId: token.chainId,
                        address: token.address,
                        name: token.name,
                        symbol: token.symbol,
                        decimals: token.decimals,
                        balance: formatted,
                        rawBalance: raw,
                        value: '$0.00',
                        logoUrl: resolvedLogo,
                        networkName,
                        networkIcon: tokenNetwork?.icon,
                        isNative: false,
                        isCustom: token.isCustom,
                        isLoading: false,
                        error: null,
                    } as AssetItem
                } catch (err) {
                    console.error(`Error loading balance for ${token.symbol}:`, err)
                    return {
                        id: token.id,
                        chainId: token.chainId,
                        address: token.address,
                        name: token.name,
                        symbol: token.symbol,
                        decimals: token.decimals,
                        balance: '0.00',
                        rawBalance: 0n,
                        value: '$0.00',
                        logoUrl: resolvedLogo,
                        networkName,
                        networkIcon: tokenNetwork?.icon,
                        isNative: false,
                        isCustom: token.isCustom,
                        isLoading: false,
                        error: 'Failed to fetch balance',
                    } as AssetItem
                }
            })

            const [nativeAssets, tokenAssets] = await Promise.all([
                Promise.all(nativePromises),
                Promise.all(tokenPromises),
            ])

            // If the user switched network or address while fetching, discard results
            if (
                currentNetwork.chainId !== networkRef.current.chainId ||
                currentAddress !== walletAddressRef.current
            ) {
                return
            }

            const activeNative = nativeAssets.find((n) => n.chainId === currentNetwork.chainId)
            setNativeBalance(activeNative ? activeNative.balance : '0.00')
            setAssets([...nativeAssets, ...tokenAssets])
        } catch (error) {
            console.error('Failed to load assets:', error)
        } finally {
            setIsLoading(false)
        }
    }, [dispatch])

    const customTokenIds = customTokens.map((t) => t.id).join(',')

    useEffect(() => {
        fetchAllAssets()
    }, [network.chainId, walletAddress, customTokenIds, fetchAllAssets])

    const deleteCustomToken = useCallback(
        async (tokenId: string) => {
            await removeStoredToken(tokenId)
            dispatch(removeCustomToken(tokenId))
            setAssets((prev) => prev.filter((a) => a.id !== tokenId))
        },
        [dispatch]
    )

    return {
        assets,
        isLoading,
        nativeBalance,
        refetch: fetchAllAssets,
        deleteCustomToken,
    }
}

export default useAssets

