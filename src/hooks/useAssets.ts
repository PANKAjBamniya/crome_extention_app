import { useState, useEffect, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import type { EVMNetwork } from '../config/networks'
import type { AssetItem, Token } from '../types/token'
import { getEVMClient } from '../services/blockchain/evmClient'
import { getTokenBalance } from '../services/token/erc20'
import { getBuiltInTokens } from '../services/token/tokenRegistry'
import {
    getTokens as getStoredCustomTokens,
    removeToken as removeStoredToken,
    saveToken as saveStoredToken,
} from '../services/token/tokenStorage'
import { resolveTokenLogo } from '../services/token/tokenLogoService'
import {
    setCustomTokens,
    removeCustomToken,
    addCustomToken,
} from '../store/slices/tokenSlice'
import { formatTokenAmount } from '../utils/token/formatTokenAmount'
import { normalizeAddress } from '../utils/token/normalizeToken'

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

    // 1. Sync custom tokens from storage for this chain
    useEffect(() => {
        let isMounted = true
        getStoredCustomTokens(network.chainId).then((tokens) => {
            if (isMounted) {
                dispatch(setCustomTokens(tokens))
            }
        })
        return () => {
            isMounted = false
        }
    }, [network.chainId, dispatch])

    // 2. Fetch balances for all assets (native + built-in + custom)
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
            // Built-in tokens for current chain
            const builtIns = getBuiltInTokens(currentNetwork.chainId)

            // Custom tokens from storage / Redux for current chain
            const storedCustom = await getStoredCustomTokens(currentNetwork.chainId)

            // Deduplicate: If custom token matches built-in address, keep built-in
            const builtInAddresses = new Set(builtIns.map((t) => normalizeAddress(t.address)))
            const uniqueCustom = storedCustom.filter(
                (t) => !builtInAddresses.has(normalizeAddress(t.address))
            )

            const allTokens: Token[] = [...builtIns, ...uniqueCustom]

            // 1. Fetch Native Balance
            const client = getEVMClient(currentNetwork)
            const nativePromise = client
                .getBalance({
                    address: currentAddress as `0x${string}`,
                })
                .then((raw) => {
                    const formatted = formatTokenAmount(
                        raw,
                        currentNetwork.nativeCurrency.decimals
                    )
                    return {
                        id: `native-${currentNetwork.chainId}`,
                        chainId: currentNetwork.chainId,
                        name: currentNetwork.nativeCurrency.name,
                        symbol: currentNetwork.nativeCurrency.symbol,
                        decimals: currentNetwork.nativeCurrency.decimals,
                        balance: formatted,
                        rawBalance: raw,
                        value: '$0.00',
                        logoUrl: currentNetwork.icon,
                        isNative: true,
                        isLoading: false,
                        error: null,
                    } as AssetItem
                })
                .catch((err) => {
                    console.error('Failed to fetch native balance:', err)
                    return {
                        id: `native-${currentNetwork.chainId}`,
                        chainId: currentNetwork.chainId,
                        name: currentNetwork.nativeCurrency.name,
                        symbol: currentNetwork.nativeCurrency.symbol,
                        decimals: currentNetwork.nativeCurrency.decimals,
                        balance: '0.00',
                        rawBalance: 0n,
                        value: '$0.00',
                        logoUrl: currentNetwork.icon,
                        isNative: true,
                        isLoading: false,
                        error: 'Failed to fetch balance',
                    } as AssetItem
                })

            // 2. Fetch ERC-20 Balances concurrently and resolve missing logos
            const tokenPromises = allTokens.map(async (token) => {
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
                    const raw = await getTokenBalance(
                        currentNetwork,
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
                        isNative: false,
                        isCustom: token.isCustom,
                        isLoading: false,
                        error: 'Failed to fetch balance',
                    } as AssetItem
                }
            })

            const [nativeAsset, ...tokenAssets] = await Promise.all([
                nativePromise,
                ...tokenPromises,
            ])

            // If the user switched network or address while fetching, discard results
            if (
                currentNetwork.chainId !== networkRef.current.chainId ||
                currentAddress !== walletAddressRef.current
            ) {
                return
            }

            setNativeBalance(nativeAsset.balance)
            setAssets([nativeAsset, ...tokenAssets])
        } catch (error) {
            console.error('Failed to load assets:', error)
        } finally {
            setIsLoading(false)
        }
    }, [dispatch])

    useEffect(() => {
        fetchAllAssets()
    }, [network.chainId, walletAddress, customTokens.length, fetchAllAssets])

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

