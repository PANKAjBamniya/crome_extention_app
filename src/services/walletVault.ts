import {
    getWallets,
    getActiveAddress,
    setActiveAddress,
    clearAll,
} from './walletStorage'

export interface EncryptedWallet {
    ciphertext: string
    iv: string
    salt: string
}

export interface StoredAccount {
    address: string
    walletName: string
}

export const saveEncryptedWallet = async (
    wallet: EncryptedWallet
): Promise<void> => {
    // Legacy adapter
    if (!wallet?.ciphertext) {
        throw new Error('Invalid encrypted wallet')
    }
}

export const getEncryptedWallet = async (): Promise<EncryptedWallet | undefined> => {
    const wallets = await getWallets()
    if (wallets.length > 0 && wallets[0].encryptedData) {
        return {
            ciphertext: wallets[0].encryptedData.ciphertext,
            iv: wallets[0].encryptedData.iv,
            salt: wallets[0].encryptedData.salt,
        }
    }
    return undefined
}

export const removeEncryptedWallet = async (): Promise<void> => {
    await clearAll()
}

export const getStoredAccounts = async (): Promise<StoredAccount[]> => {
    const wallets = await getWallets()
    return wallets.map((w) => ({
        address: w.address,
        walletName: w.walletName || w.name || 'Account 1',
    }))
}

export const saveWalletAddress = async (
    address: string,
    walletName = 'Account 1'
): Promise<void> => {
    await setActiveAddress(address, walletName)
}

export const setActiveAccount = async (
    address: string,
    walletName: string
): Promise<void> => {
    await setActiveAddress(address, walletName)
}

export const getWalletAddress = async (): Promise<{
    address: string | null
    walletName: string
}> => {
    return getActiveAddress()
}

export const removeWalletAddress = async (): Promise<void> => {
    await clearAll()
}