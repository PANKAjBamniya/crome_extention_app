import { getAddress, isAddress } from 'viem'
import { normalizeAddress, createTokenId } from '../../utils/token/normalizeToken'

export interface ResolveTokenLogoParams {
    chainId: number
    address: string
    symbol?: string
}

/**
 * Trust Wallet assets repository chain folder mapping.
 */
const CHAIN_FOLDER_MAP: Record<number, string> = {
    1: 'ethereum',
    56: 'smartchain',
    137: 'polygon',
    42161: 'arbitrum',
}

/**
 * In-memory cache for resolved token logo URLs to prevent redundant network requests.
 * Key: `${chainId}:${normalizedAddress}`
 * Value: string (logo URL) | undefined (no logo found)
 */
const logoCache = new Map<string, string | undefined>()

/**
 * Builds the canonical Trust Wallet repository logo URL for a token.
 */
export const getTrustWalletLogoUrl = (
    chainId: number,
    address: string
): string | undefined => {
    const chainFolder = CHAIN_FOLDER_MAP[chainId]
    if (!chainFolder || !isAddress(address)) {
        return undefined
    }

    try {
        const checksumAddress = getAddress(address)
        return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainFolder}/assets/${checksumAddress}/logo.png`
    } catch {
        return undefined
    }
}

/**
 * Resolves the logo URL for any ERC-20 token based strictly on its chainId and contract address.
 *
 * Behavior:
 * 1. Checks in-memory cache first to avoid duplicate network calls.
 * 2. Queries standard EVM asset repositories (e.g. Trust Wallet Assets).
 * 3. Verifies resource availability via lightweight HEAD request with timeout.
 * 4. Returns verified URL, or undefined if not found or unavailable.
 * 5. Caches the result (both hits and misses).
 * 6. Never throws an error or breaks the caller.
 */
export const resolveTokenLogo = async ({
    chainId,
    address,
}: ResolveTokenLogoParams): Promise<string | undefined> => {
    if (!address || !isAddress(address)) {
        return undefined
    }

    const normalized = normalizeAddress(address)
    const cacheKey = createTokenId(chainId, normalized)

    // 1. Check in-memory cache
    if (logoCache.has(cacheKey)) {
        return logoCache.get(cacheKey)
    }

    const candidateUrl = getTrustWalletLogoUrl(chainId, normalized)
    if (!candidateUrl) {
        logoCache.set(cacheKey, undefined)
        return undefined
    }

    // 2. Verify candidate URL with a lightweight HEAD request (timeout 2.5s)
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2500)

        const response = await fetch(candidateUrl, {
            method: 'HEAD',
            signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (response.ok) {
            logoCache.set(cacheKey, candidateUrl)
            return candidateUrl
        }

        // 404 or non-200
        logoCache.set(cacheKey, undefined)
        return undefined
    } catch {
        // Network timeout, offline, or CORS failure - fail gracefully to undefined
        logoCache.set(cacheKey, undefined)
        return undefined
    }
}

/**
 * Pre-populates the logo cache (e.g. for built-in tokens).
 */
export const primeLogoCache = (
    chainId: number,
    address: string,
    logoUrl?: string
) => {
    const cacheKey = createTokenId(chainId, normalizeAddress(address))
    logoCache.set(cacheKey, logoUrl)
}

export default resolveTokenLogo

