import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Hex } from 'viem'

interface WalletData {
    seedPhrase: string
    privateKey: Hex
    address: string
}

export interface AccountItem {
    address: string
    walletName: string
}

interface WalletState {
    seedPhrase: string | null
    privateKey: Hex | null
    address: string | null

    createdPassword: string | null

    walletName: string
    isImported: boolean
    accounts: AccountItem[]
    isUnlocked: boolean
}

const initialState: WalletState = {
    seedPhrase: null,
    privateKey: null,
    address: null,

    createdPassword: null,

    walletName: 'Account 1',
    isImported: false,
    accounts: [],
    isUnlocked: false,
}

const walletSlice = createSlice({
    name: 'wallet',

    initialState,

    reducers: {
        // Create wallet
        setCreatedWallet: (
            state,
            action: PayloadAction<WalletData>
        ) => {
            state.seedPhrase = action.payload.seedPhrase
            state.privateKey = action.payload.privateKey
            state.address = action.payload.address
            state.isImported = false
            const defaultName = state.accounts.length > 0 ? `Account ${state.accounts.length + 1}` : 'Account 1'
            state.walletName = defaultName
            if (!state.accounts.some(acc => acc.address.toLowerCase() === action.payload.address.toLowerCase())) {
                state.accounts.push({ address: action.payload.address, walletName: defaultName })
            }
        },

        // Import wallet
        setImportedWallet: (
            state,
            action: PayloadAction<WalletData>
        ) => {
            state.seedPhrase = action.payload.seedPhrase
            state.privateKey = action.payload.privateKey
            state.address = action.payload.address
            state.isImported = true
            const defaultName = state.accounts.length > 0 ? `Account ${state.accounts.length + 1}` : 'Account 1'
            state.walletName = defaultName
            if (!state.accounts.some(acc => acc.address.toLowerCase() === action.payload.address.toLowerCase())) {
                state.accounts.push({ address: action.payload.address, walletName: defaultName })
            }
        },

        // Save password temporarily
        setCreatedPassword: (
            state,
            action: PayloadAction<string>
        ) => {
            state.createdPassword = action.payload
        },

        // Clear sensitive data after encryption
        clearSensitiveWalletData: (state) => {
            state.seedPhrase = null
            state.privateKey = null
            state.createdPassword = null
        },

        // Hydrate or update wallet address
        setWalletAddress: (
            state,
            action: PayloadAction<{ address: string; walletName?: string }>
        ) => {
            state.address = action.payload.address
            if (action.payload.walletName) {
                state.walletName = action.payload.walletName
            }
            if (!state.accounts.some(acc => acc.address.toLowerCase() === action.payload.address.toLowerCase())) {
                state.accounts.push({
                    address: action.payload.address,
                    walletName: action.payload.walletName || state.walletName,
                })
            }
        },

        // Set entire accounts list
        setAccounts: (
            state,
            action: PayloadAction<AccountItem[]>
        ) => {
            state.accounts = action.payload
        },

        // Set unlocked status
        setUnlocked: (
            state,
            action: PayloadAction<boolean>
        ) => {
            state.isUnlocked = action.payload
        },

        // Lock wallet and clear sensitive runtime data
        lockWallet: (state) => {
            state.isUnlocked = false
            state.seedPhrase = null
            state.privateKey = null
            state.createdPassword = null
        },

        // Reset complete wallet state
        resetWalletState: () => initialState,
    },
})

export const {
    setCreatedWallet,
    setImportedWallet,
    setCreatedPassword,
    clearSensitiveWalletData,
    setWalletAddress,
    setAccounts,
    setUnlocked,
    lockWallet,
    resetWalletState,
} = walletSlice.actions

export default walletSlice.reducer