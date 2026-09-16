import type { Token } from '../../types/token'
import { normalizeAddress, createTokenId } from '../../utils/token/normalizeToken'

const STORAGE_KEY_TOKENS = 'cryptiva_custom_tokens'

const hasChromeStorage =
    typeof chrome !== 'undefined' && chrome.storage?.local !== undefined

const getStorageItem = async <T>(key: string): Promise<T | undefined> => {
    if (hasChromeStorage) {
        try {
            const result = await chrome.storage.local.get(key)
            return result[key] as T | undefined
        } catch (err) {
            console.error(`Failed to read "${key}" from chrome.storage:`, err)
            return undefined
        }
    }

    try {
        const item = localStorage.getItem(key)
        if (!item) return undefined
        return JSON.parse(item) as T
    } catch {
        return undefined
    }
}

const setStorageItem = async (key: string, value: any): Promise<void> => {
    if (hasChromeStorage) {
        try {
            await chrome.storage.local.set({ [key]: value })
            return
        } catch (err) {
            console.error(`Failed to write "${key}" to chrome.storage:`, err)
        }
    }

    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
        console.error(`Failed to write "${key}" to localStorage:`, err)
    }
}

/**
 * Returns all custom tokens, optionally filtered by chainId.
 */
export const getTokens = async (chainId?: number): Promise<Token[]> => {
    const tokens = (await getStorageItem<Token[]>(STORAGE_KEY_TOKENS)) || []
    if (!Array.isArray(tokens)) {
        return []
    }
    if (chainId !== undefined) {
        return tokens.filter((t) => t.chainId === chainId)
    }
    return tokens
}

/**
 * Finds a specific token by chainId and contract address.
 */
export const findToken = async (
    chainId: number,
    address: string
): Promise<Token | undefined> => {
    if (!address) return undefined
    const cleanAddress = normalizeAddress(address)
    const tokens = await getTokens(chainId)
    return tokens.find((t) => normalizeAddress(t.address) === cleanAddress)
}

/**
 * Checks if a token already exists in storage.
 */
export const hasToken = async (
    chainId: number,
    address: string
): Promise<boolean> => {
    const existing = await findToken(chainId, address)
    return Boolean(existing)
}

/**
 * Persists a token to storage. Prevents duplicate addition based on chainId + address.
 */
export const saveToken = async (token: Token): Promise<void> => {
    if (!token || !token.address || !token.chainId) {
        throw new Error('Invalid token data')
    }

    const normalizedAddress = normalizeAddress(token.address)
    const tokenId = createTokenId(token.chainId, normalizedAddress)

    const normalizedToken: Token = {
        ...token,
        id: tokenId,
        address: normalizedAddress,
        isCustom: true,
        createdAt: token.createdAt || Date.now(),
    }

    const currentTokens = await getTokens()
    const index = currentTokens.findIndex(
        (t) =>
            t.id === tokenId ||
            (t.chainId === normalizedToken.chainId &&
                normalizeAddress(t.address) === normalizedAddress)
    )

    let updated: Token[]
    if (index >= 0) {
        // Update existing record
        updated = [...currentTokens]
        updated[index] = normalizedToken
    } else {
        // Add new record
        updated = [...currentTokens, normalizedToken]
    }

    await setStorageItem(STORAGE_KEY_TOKENS, updated)
}

/**
 * Removes a custom token by its unique ID.
 */
export const removeToken = async (id: string): Promise<void> => {
    const currentTokens = await getTokens()
    const filtered = currentTokens.filter((t) => t.id !== id)
    await setStorageItem(STORAGE_KEY_TOKENS, filtered)
}

/**
 * Clears all custom tokens from storage.
 */
export const clearAllTokens = async (): Promise<void> => {
    if (hasChromeStorage) {
        try {
            await chrome.storage.local.remove(STORAGE_KEY_TOKENS)
            return
        } catch (err) {
            console.error('Failed to remove tokens from chrome storage:', err)
        }
    }
    localStorage.removeItem(STORAGE_KEY_TOKENS)
}

