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
    deleteWallet,
    getActiveWalletId,
    getActiveAddress,
    setActiveAddress,
    StoredWallet,
    StoredAccountSummary,
    WalletType,
} from '../services/walletStorage'
import { evmWalletHandler } from '../wallet/walletHandler'

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

export interface RevealSecretsResult {
    success: boolean
    error?: string
    privateKey?: string
    seedPhrase?: string
    isMnemonic: boolean
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

    /**
     * Securely decrypts and reveals secrets (Private Key and/or SRP) for a given account address.
     * Never logs sensitive data or persists it to disk.
     */
    const revealAccountSecrets = useCallback(
        async (address: string, pin: string): Promise<RevealSecretsResult> => {
            const wallets = await getWallets()
            const target = wallets.find(
                (w) => w.address.toLowerCase() === address.toLowerCase()
            )

            if (!target) {
                return {
                    success: false,
                    error: 'Account not found',
                    isMnemonic: false,
                }
            }

            try {
                const decrypted = await decrypt(target.encryptedData, pin)
                if (!decrypted) {
                    return {
                        success: false,
                        error: 'Incorrect PIN. Please try again.',
                        isMnemonic: false,
                    }
                }

                const cleanDecrypted = decrypted.trim()
                const isMnemonic =
                    target.type === 'mnemonic' ||
                    cleanDecrypted.split(/\s+/).length >= 12

                if (isMnemonic) {
                    let derivedKey: string | undefined
                    for (let idx = 0; idx < 20; idx++) {
                        const derived = await evmWalletHandler.importWalletFromMnemonic(
                            cleanDecrypted,
                            idx
                        )
                        if (
                            derived.address.toLowerCase() ===
                            target.address.toLowerCase()
                        ) {
                            derivedKey = derived.privateKey
                            break
                        }
                    }

                    if (!derivedKey) {
                        const fallback =
                            await evmWalletHandler.importWalletFromMnemonic(
                                cleanDecrypted,
                                0
                            )
                        derivedKey = fallback.privateKey
                    }

                    return {
                        success: true,
                        privateKey: derivedKey,
                        seedPhrase: cleanDecrypted,
                        isMnemonic: true,
                    }
                } else {
                    let cleanKey = cleanDecrypted
                    if (!cleanKey.startsWith('0x')) {
                        cleanKey = `0x${cleanKey}`
                    }
                    return {
                        success: true,
                        privateKey: cleanKey,
                        isMnemonic: false,
                    }
                }
            } catch {
                return {
                    success: false,
                    error: 'Incorrect PIN. Please try again.',
                    isMnemonic: false,
                }
            }
        },
        [decrypt]
    )

    /**
     * Removes an account from storage safely if more than 1 account exists.
     */
    const removeAccount = useCallback(
        async (address: string): Promise<{ success: boolean; error?: string }> => {
            const wallets = await getWallets()
            if (wallets.length <= 1) {
                return {
                    success: false,
                    error: 'Cannot remove your only account.',
                }
            }

            const target = wallets.find(
                (w) => w.address.toLowerCase() === address.toLowerCase()
            )
            if (!target) {
                return {
                    success: false,
                    error: 'Account not found.',
                }
            }

            await deleteWallet(target.id)

            const remainingWallets = await getWallets()
            const accounts: StoredAccountSummary[] = remainingWallets.map((w) => ({
                address: w.address,
                walletName: w.walletName || w.name || 'Account 1',
            }))
            dispatch(setAccounts(accounts))

            const activeAddr = await getActiveAddress()
            if (activeAddr.address) {
                dispatch(
                    setWalletAddress({
                        address: activeAddr.address,
                        walletName: activeAddr.walletName,
                    })
                )
            }

            return { success: true }
        },
        [dispatch]
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
        revealAccountSecrets,
        removeAccount,
        lockWallet: lock,
    }
}

export default useWalletManager

