import type { EncryptedData } from '../hook/useEncryption/useEncryption'

export type WalletType = 'mnemonic' | 'privateKey'

export interface StoredWallet {
    id: string
    address: string
    name: string
    walletName?: string
    type: WalletType
    encryptedData: EncryptedData
    createdAt: number
}

export interface StoredAccountSummary {
    address: string
    walletName: string
}

const STORAGE_KEYS = {
    WALLETS: 'vault_wallets_v2',
    ACTIVE_WALLET_ID: 'vault_active_wallet_id',
    ACTIVE_ADDRESS: 'vault_active_address',
    ACTIVE_WALLET_NAME: 'vault_active_wallet_name',
    ACTIVE_NETWORK_ID: 'vault_active_network_id',
    // Legacy keys for backward compatibility
    LEGACY_ENCRYPTED_WALLET: 'encrypted_wallet',
    LEGACY_ADDRESS: 'wallet_address',
    LEGACY_WALLET_NAME: 'wallet_name',
    LEGACY_ACCOUNTS: 'wallet_accounts',
} as const

const hasChromeStorage =
    typeof chrome !== 'undefined' &&
    chrome.storage?.local !== undefined

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
        const raw = localStorage.getItem(key)
        return (raw as unknown as T) ?? undefined
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
        if (typeof value === 'string') {
            localStorage.setItem(key, value)
        } else {
            localStorage.setItem(key, JSON.stringify(value))
        }
    } catch (err) {
        console.error(`Failed to write "${key}" to localStorage:`, err)
    }
}

const removeStorageItem = async (key: string): Promise<void> => {
    if (hasChromeStorage) {
        try {
            await chrome.storage.local.remove(key)
            return
        } catch (err) {
            console.error(`Failed to remove "${key}" from chrome.storage:`, err)
        }
    }

    localStorage.removeItem(key)
}

export const getWallets = async (): Promise<StoredWallet[]> => {
    const wallets = await getStorageItem<StoredWallet[]>(STORAGE_KEYS.WALLETS)
    if (Array.isArray(wallets) && wallets.length > 0) {
        return wallets.map((w) => ({
            ...w,
            name: w.name || w.walletName || 'Account 1',
            walletName: w.walletName || w.name || 'Account 1',
        }))
    }

    // Check legacy storage for backward compatibility
    const legacyEncrypted = await getStorageItem<any>(STORAGE_KEYS.LEGACY_ENCRYPTED_WALLET)
    const legacyAddress = await getStorageItem<string>(STORAGE_KEYS.LEGACY_ADDRESS)
    const legacyWalletName = (await getStorageItem<string>(STORAGE_KEYS.LEGACY_WALLET_NAME)) || 'Account 1'

    if (legacyEncrypted?.ciphertext && legacyAddress) {
        const migratedWallet: StoredWallet = {
            id: `wallet_${Date.now()}_legacy`,
            address: legacyAddress,
            name: legacyWalletName,
            walletName: legacyWalletName,
            type: 'mnemonic',
            encryptedData: {
                ciphertext: legacyEncrypted.ciphertext,
                iv: legacyEncrypted.iv,
                salt: legacyEncrypted.salt,
            },
            createdAt: Date.now(),
        }
        await setStorageItem(STORAGE_KEYS.WALLETS, [migratedWallet])
        await setStorageItem(STORAGE_KEYS.ACTIVE_WALLET_ID, migratedWallet.id)
        await setStorageItem(STORAGE_KEYS.ACTIVE_ADDRESS, migratedWallet.address)
        await setStorageItem(STORAGE_KEYS.ACTIVE_WALLET_NAME, migratedWallet.name)
        return [migratedWallet]
    }

    return []
}

export const hasWallets = async (): Promise<boolean> => {
    const wallets = await getWallets()
    return wallets.length > 0
}

export const getWallet = async (id: string): Promise<StoredWallet | undefined> => {
    const wallets = await getWallets()
    return wallets.find((w) => w.id === id)
}

export const findWalletByAddress = async (address: string): Promise<StoredWallet | undefined> => {
    if (!address) return undefined
    const clean = address.trim().toLowerCase()
    const wallets = await getWallets()
    return wallets.find((w) => w.address.toLowerCase() === clean)
}

export const saveWallet = async (wallet: StoredWallet): Promise<void> => {
    if (!wallet || !wallet.address) {
        throw new Error('Invalid wallet data')
    }

    const resolvedName = wallet.name || wallet.walletName || 'Account 1'
    const normalizedWallet: StoredWallet = {
        ...wallet,
        name: resolvedName,
        walletName: resolvedName,
    }

    const wallets = await getWallets()
    const index = wallets.findIndex(
        (w) => w.id === normalizedWallet.id || w.address.toLowerCase() === normalizedWallet.address.toLowerCase()
    )

    let updated: StoredWallet[]
    if (index >= 0) {
        updated = [...wallets]
        updated[index] = normalizedWallet
    } else {
        updated = [...wallets, normalizedWallet]
    }

    await setStorageItem(STORAGE_KEYS.WALLETS, updated)

    // Keep legacy accounts in sync so any other screens reading legacy keys remain functional
    const legacyAccounts = updated.map((w) => ({ address: w.address, walletName: w.name }))
    await setStorageItem(STORAGE_KEYS.LEGACY_ACCOUNTS, legacyAccounts)

    // Set active if none set
    const activeId = await getStorageItem<string>(STORAGE_KEYS.ACTIVE_WALLET_ID)
    if (!activeId) {
        await setActiveWalletId(normalizedWallet.id)
    }
}

export const updateWallet = async (wallet: StoredWallet): Promise<void> => {
    await saveWallet(wallet)
}

export const deleteWallet = async (id: string): Promise<void> => {
    const wallets = await getWallets()
    const filtered = wallets.filter((w) => w.id !== id)
    await setStorageItem(STORAGE_KEYS.WALLETS, filtered)

    const legacyAccounts = filtered.map((w) => ({ address: w.address, walletName: w.name }))
    await setStorageItem(STORAGE_KEYS.LEGACY_ACCOUNTS, legacyAccounts)

    const activeId = await getStorageItem<string>(STORAGE_KEYS.ACTIVE_WALLET_ID)
    if (activeId === id) {
        if (filtered.length > 0) {
            await setActiveWalletId(filtered[0].id)
        } else {
            await removeStorageItem(STORAGE_KEYS.ACTIVE_WALLET_ID)
            await removeStorageItem(STORAGE_KEYS.ACTIVE_ADDRESS)
            await removeStorageItem(STORAGE_KEYS.ACTIVE_WALLET_NAME)
        }
    }
}

export const getActiveWalletId = async (): Promise<string | null> => {
    const id = await getStorageItem<string>(STORAGE_KEYS.ACTIVE_WALLET_ID)
    if (id) return id

    const wallets = await getWallets()
    if (wallets.length > 0) {
        await setActiveWalletId(wallets[0].id)
        return wallets[0].id
    }

    return null
}

export const setActiveWalletId = async (id: string): Promise<void> => {
    await setStorageItem(STORAGE_KEYS.ACTIVE_WALLET_ID, id)
    const wallets = await getWallets()
    const target = wallets.find((w) => w.id === id)
    if (target) {
        await setStorageItem(STORAGE_KEYS.ACTIVE_ADDRESS, target.address)
        await setStorageItem(STORAGE_KEYS.ACTIVE_WALLET_NAME, target.name)
        // Also sync legacy keys
        await setStorageItem(STORAGE_KEYS.LEGACY_ADDRESS, target.address)
        await setStorageItem(STORAGE_KEYS.LEGACY_WALLET_NAME, target.name)
    }
}

export const getActiveAddress = async (): Promise<{ address: string | null; walletName: string }> => {
    const address = await getStorageItem<string>(STORAGE_KEYS.ACTIVE_ADDRESS)
    const walletName = (await getStorageItem<string>(STORAGE_KEYS.ACTIVE_WALLET_NAME)) || 'Account 1'
    if (address) {
        return { address, walletName }
    }

    const wallets = await getWallets()
    if (wallets.length > 0) {
        await setActiveWalletId(wallets[0].id)
        return { address: wallets[0].address, walletName: wallets[0].name }
    }

    return { address: null, walletName: 'Account 1' }
}

export const setActiveAddress = async (address: string, walletName?: string): Promise<void> => {
    const cleanAddress = address.trim().toLowerCase()
    const wallets = await getWallets()
    const target = wallets.find((w) => w.address.toLowerCase() === cleanAddress)

    if (target) {
        await setActiveWalletId(target.id)
    } else {
        await setStorageItem(STORAGE_KEYS.ACTIVE_ADDRESS, address)
        if (walletName) {
            await setStorageItem(STORAGE_KEYS.ACTIVE_WALLET_NAME, walletName)
        }
    }
}

export const getActiveNetworkId = async (): Promise<string | null> => {
    const netId = await getStorageItem<string>(STORAGE_KEYS.ACTIVE_NETWORK_ID)
    return netId || null
}

export const setActiveNetworkId = async (networkId: string): Promise<void> => {
    await setStorageItem(STORAGE_KEYS.ACTIVE_NETWORK_ID, networkId)
}

export const clearAll = async (): Promise<void> => {
    for (const key of Object.values(STORAGE_KEYS)) {
        await removeStorageItem(key)
    }
}
