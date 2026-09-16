import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../store'
import {
    setWalletAddress,
    setAccounts,
    setUnlocked,
    lockWallet as lockWalletAction,
} from '../store/slices/walletSlice'
import useEncryption from './useEncryption/useEncryption'
import {
    getWallets,
    hasWallets,
    findWalletByAddress,
    saveWallet,
    getActiveWalletId,
    getActiveAddress,
    setActiveAddress,
    StoredWallet,
    StoredAccountSummary,
    WalletType,
} from '../services/walletStorage'

export interface SaveNewWalletParams {
    secret: string
    address: string
    password: string
    walletType: WalletType
    walletName?: string
}

export interface UnlockResult {
    success: boolean
    error?: string
    activeWallet?: StoredWallet
    accounts: StoredAccountSummary[]
}

export const useWalletManager = () => {
    const { encrypt, decrypt } = useEncryption()
    const dispatch = useDispatch<AppDispatch>()

    const hasExistingWallet = useCallback(async (): Promise<boolean> => {
        return hasWallets()
    }, [])

    const hasPassword = useCallback(async (): Promise<boolean> => {
        return hasWallets()
    }, [])

    const getAllWallets = useCallback(async (): Promise<StoredWallet[]> => {
        return getWallets()
    }, [])

    const findExisting = useCallback(
        async (address: string): Promise<StoredWallet | undefined> => {
            return findWalletByAddress(address)
        },
        []
    )

    const getStoredAccounts = useCallback(async (): Promise<StoredAccountSummary[]> => {
        const wallets = await getWallets()
        return wallets.map((w) => ({
            address: w.address,
            walletName: w.walletName || w.name || 'Account 1',
        }))
    }, [])

    const getActiveAccount = useCallback(async () => {
        return getActiveAddress()
    }, [])

    const switchActiveAccount = useCallback(
        async (address: string, walletName?: string): Promise<void> => {
            await setActiveAddress(address, walletName)
            dispatch(
                setWalletAddress({
                    address,
                    walletName: walletName || 'Account 1',
                })
            )
        },
        [dispatch]
    )

    /**
     * Verifies the entered password by attempting to decrypt the first stored wallet's secret.
     * With AES-GCM, an invalid key derived from an incorrect PIN triggers an OperationError.
     */
    const verifyPassword = useCallback(
        async (password: string): Promise<boolean> => {
            const wallets = await getWallets()
            if (wallets.length === 0) return true

            const walletToVerify = wallets[0]
            try {
                const decrypted = await decrypt(walletToVerify.encryptedData, password)
                return typeof decrypted === 'string' && decrypted.length > 0
            } catch {
                return false
            }
        },
        [decrypt]
    )

    /**
     * Saves a new wallet after encrypting the secret with the provided PIN.
     * Prevents duplicates by derived address.
     */
    const saveNewWallet = useCallback(
        async ({
            secret,
            address,
            password,
            walletType,
            walletName,
        }: SaveNewWalletParams): Promise<StoredWallet> => {
            if (!address) {
                throw new Error('Wallet address is required')
            }

            // 1. Check duplicate
            const existing = await findWalletByAddress(address)
            if (existing) {
                const existingName = existing.walletName || existing.name || 'Account 1'
                await setActiveAddress(existing.address, existingName)
                return {
                    ...existing,
                    walletName: existingName,
                    name: existingName,
                }
            }

            // 2. Count existing accounts to name default
            const wallets = await getWallets()
            const defaultName = `Account ${wallets.length + 1}`
            const finalName = walletName || defaultName

            // 3. Encrypt secret with existing hook
            const encryptedData = await encrypt(secret, password)

            // 4. Create and persist StoredWallet
            const newWallet: StoredWallet = {
                id: `wallet_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                address,
                name: finalName,
                walletName: finalName,
                type: walletType,
                encryptedData,
                createdAt: Date.now(),
            }

            await saveWallet(newWallet)
            await setActiveAddress(newWallet.address, finalName)

            // 5. Update runtime Redux state
            const updatedWallets = await getWallets()
            const accounts: StoredAccountSummary[] = updatedWallets.map((w) => ({
                address: w.address,
                walletName: w.walletName || w.name || 'Account 1',
            }))

            dispatch(setUnlocked(true))
            dispatch(
                setWalletAddress({
                    address: newWallet.address,
                    walletName: finalName,
                })
            )
            dispatch(setAccounts(accounts))

            return newWallet
        },
        [encrypt, dispatch]
    )

    /**
     * Unlocks the wallet by decrypting the target or active wallet with the entered PIN.
     * If successful, hydrates Redux state and marks wallet as unlocked.
     */
    const unlockWallet = useCallback(
        async (password: string, targetAddress?: string): Promise<UnlockResult> => {
            const wallets = await getWallets()
            if (wallets.length === 0) {
                return {
                    success: false,
                    error: 'No wallets found',
                    accounts: [],
                }
            }

            let target = targetAddress
                ? wallets.find(
                    (w) => w.address.toLowerCase() === targetAddress.toLowerCase()
                )
                : undefined

            if (!target) {
                const activeId = await getActiveWalletId()
                target = wallets.find((w) => w.id === activeId) || wallets[0]
            }

            try {
                const decryptedSecret = await decrypt(target.encryptedData, password)
                if (!decryptedSecret) {
                    return {
                        success: false,
                        error: 'Incorrect PIN. Please try again.',
                        accounts: [],
                    }
                }

                const targetName = target.walletName || target.name || 'Account 1'
                await setActiveAddress(target.address, targetName)

                const accounts: StoredAccountSummary[] = wallets.map((w) => ({
                    address: w.address,
                    walletName: w.walletName || w.name || 'Account 1',
                }))

                dispatch(setUnlocked(true))
                dispatch(
                    setWalletAddress({
                        address: target.address,
                        walletName: targetName,
                    })
                )
                dispatch(setAccounts(accounts))

                return {
                    success: true,
                    activeWallet: {
                        ...target,
                        walletName: targetName,
                        name: targetName,
                    },
                    accounts,
                }
            } catch {
                return {
                    success: false,
                    error: 'Incorrect PIN. Please try again.',
                    accounts: [],
                }
            }
        },
        [decrypt, dispatch]
    )

    const lock = useCallback(() => {
        dispatch(lockWalletAction())
    }, [dispatch])

    return {
        hasExistingWallet,
        hasPassword,
        getWallets: getAllWallets,
        findExistingWallet: findExisting,
        getActiveAccount,
        getStoredAccounts,
        switchActiveAccount,
        verifyPassword,
        saveNewWallet,
        unlockWallet,
        lockWallet: lock,
    }
}

export default useWalletManager

