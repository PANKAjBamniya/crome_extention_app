import type { Token } from '../../types/token'
import { normalizeAddress, createTokenId } from '../../utils/token/normalizeToken'
import { DEFAULT_ACTIVE_TOKENS } from './tokenRegistry'

const STORAGE_KEY_ACTIVE_TOKENS = 'crypto_active_user_tokens'
const STORAGE_KEY_INITIALIZED = 'crypto_active_user_tokens_initialized'
const STORAGE_KEY_LEGACY_TOKENS = 'crypto_custom_tokens'

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
 * Returns all active user-added/imported tokens.
 * On a fresh wallet installation, default ERC-20 list is empty
 * (only the 5 native tokens are active by default).
 */
export const getActiveTokens = async (chainId?: number): Promise<Token[]> => {
    const isInitialized = await getStorageItem<boolean>(STORAGE_KEY_INITIALIZED)
    let tokens = await getStorageItem<Token[]>(STORAGE_KEY_ACTIVE_TOKENS)

    if (!isInitialized || tokens === undefined) {
        // Fresh wallet: active ERC-20 tokens list is empty by default
        const initial: Token[] = []

        await setStorageItem(STORAGE_KEY_ACTIVE_TOKENS, initial)
        await setStorageItem(STORAGE_KEY_INITIALIZED, true)
        await setStorageItem(STORAGE_KEY_LEGACY_TOKENS, initial)
        tokens = initial
    }

    if (!Array.isArray(tokens)) {
        return []
    }

    if (chainId !== undefined) {
        return tokens.filter((t) => t.chainId === chainId)
    }

    return tokens
}

/**
 * Backward compatibility alias for getActiveTokens.
 */
export const getTokens = getActiveTokens

/**
 * Finds a specific active token by chainId and contract address.
 */
export const findActiveToken = async (
    chainId: number,
    address: string
): Promise<Token | undefined> => {
    if (!address) return undefined
    const cleanAddress = normalizeAddress(address)
    const tokens = await getActiveTokens(chainId)
    return tokens.find((t) => normalizeAddress(t.address) === cleanAddress)
}

/**
 * Backward compatibility alias for findActiveToken.
 */
export const findToken = findActiveToken

/**
 * Checks if a token already exists in active user tokens.
 */
export const hasActiveToken = async (
    chainId: number,
    address: string
): Promise<boolean> => {
    const existing = await findActiveToken(chainId, address)
    return Boolean(existing)
}

/**
 * Backward compatibility alias for hasActiveToken.
 */
export const hasToken = hasActiveToken

/**
 * Persists a token to active user tokens.
 * Prevents duplicate addition based on chainId + normalized contract address.
 */
export const saveActiveToken = async (token: Token): Promise<void> => {
    if (!token || !token.address || !token.chainId) {
        throw new Error('Invalid token data')
    }

    const normalizedAddress = normalizeAddress(token.address)
    const tokenId = createTokenId(token.chainId, normalizedAddress)

    const normalizedToken: Token = {
        ...token,
        id: tokenId,
        address: normalizedAddress,
        isCustom: token.isCustom ?? true,
        createdAt: token.createdAt || Date.now(),
    }

    const currentTokens = await getActiveTokens()
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

    await setStorageItem(STORAGE_KEY_ACTIVE_TOKENS, updated)
    await setStorageItem(STORAGE_KEY_LEGACY_TOKENS, updated)
}

/**
 * Backward compatibility alias for saveActiveToken.
 */
export const saveToken = saveActiveToken

/**
 * Removes an active user token by its unique ID.
 */
export const removeActiveToken = async (id: string): Promise<void> => {
    const currentTokens = await getActiveTokens()
    const filtered = currentTokens.filter((t) => t.id !== id)
    await setStorageItem(STORAGE_KEY_ACTIVE_TOKENS, filtered)
    await setStorageItem(STORAGE_KEY_LEGACY_TOKENS, filtered)
}

/**
 * Backward compatibility alias for removeActiveToken.
 */
export const removeToken = removeActiveToken

/**
 * Resets active tokens to default state.
 */
export const resetToDefaultTokens = async (): Promise<Token[]> => {
    const defaults = [...DEFAULT_ACTIVE_TOKENS]
    await setStorageItem(STORAGE_KEY_ACTIVE_TOKENS, defaults)
    await setStorageItem(STORAGE_KEY_INITIALIZED, true)
    await setStorageItem(STORAGE_KEY_LEGACY_TOKENS, defaults)
    return defaults
}

/**
 * Clears all active tokens from storage.
 */
export const clearAllTokens = async (): Promise<void> => {
    if (hasChromeStorage) {
        try {
            await chrome.storage.local.remove([
                STORAGE_KEY_ACTIVE_TOKENS,
                STORAGE_KEY_INITIALIZED,
                STORAGE_KEY_LEGACY_TOKENS,
            ])
            return
        } catch (err) {
            console.error('Failed to remove tokens from chrome storage:', err)
        }
    }
    localStorage.removeItem(STORAGE_KEY_ACTIVE_TOKENS)
    localStorage.removeItem(STORAGE_KEY_INITIALIZED)
    localStorage.removeItem(STORAGE_KEY_LEGACY_TOKENS)
}

