import { evmWalletHandler } from "./walletHandler"
import type {
    EvmCreatedWallet,
    EvmImportedWallet,
    WordValidationResult,
} from "./handlers/evmWalletHandler"

export type { EvmCreatedWallet, EvmImportedWallet, WordValidationResult }

export const createWallet = async (): Promise<EvmCreatedWallet> => {
    return evmWalletHandler.createWallet()
}

export const importWalletFromMnemonic = async (
    mnemonic: string
): Promise<EvmImportedWallet> => {
    return evmWalletHandler.importWalletFromMnemonic(mnemonic)
}

export const importWalletFromPrivateKey = async (
    privateKey: string
): Promise<EvmImportedWallet> => {
    return evmWalletHandler.importWalletFromPrivateKey(privateKey)
}

export const validateRecoveryWord = (word: string): boolean => {
    return evmWalletHandler.validateWord(word)
}

export const validateRecoveryWords = (words: string[]): WordValidationResult => {
    return evmWalletHandler.validateWords(words)
}

export const validateRecoveryPhrase = (mnemonic: string): boolean => {
    return evmWalletHandler.validateMnemonic(mnemonic)
}


