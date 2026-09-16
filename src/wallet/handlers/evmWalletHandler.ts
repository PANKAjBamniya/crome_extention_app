import { toHex, type Hex, type Address } from "viem"
import { english, generateMnemonic, mnemonicToAccount, privateKeyToAccount } from "viem/accounts"
import { validateMnemonic } from "@scure/bip39"

export interface EvmCreatedWallet {
    mnemonic: string
    privateKey: Hex
    address: Address
}

export interface EvmImportedWallet {
    privateKey: Hex
    address: Address
}

export interface WordValidationResult {
    isValid: boolean
    invalidIndexes: number[]
}

export class EvmWalletHandler {
    private englishWordsSet = new Set<string>(english)

    validateWord(word: string): boolean {
        return this.englishWordsSet.has(word.trim().toLowerCase())
    }

    validateWords(words: string[]): WordValidationResult {
        const invalidIndexes: number[] = []

        words.forEach((word, index) => {
            const clean = word.trim().toLowerCase()
            if (!clean || !this.validateWord(clean)) {
                invalidIndexes.push(index)
            }
        })

        return {
            isValid: invalidIndexes.length === 0,
            invalidIndexes,
        }
    }

    validateMnemonic(mnemonic: string): boolean {
        const clean = mnemonic.trim().toLowerCase()
        return validateMnemonic(clean, english)
    }

    async createWallet(): Promise<EvmCreatedWallet> {
        const mnemonic = generateMnemonic(english)
        const account = mnemonicToAccount(mnemonic)
        const privateKeyBytes = account.getHdKey().privateKey

        if (!privateKeyBytes) {
            throw new Error('Failed to generate private key')
        }

        return {
            mnemonic,
            privateKey: toHex(privateKeyBytes),
            address: account.address,
        }
    }

    async importWalletFromMnemonic(
        mnemonic: string,
        index = 0
    ): Promise<EvmImportedWallet> {
        const account = mnemonicToAccount(
            mnemonic,
            { addressIndex: index }
        )

        const privateKeyBytes = account.getHdKey().privateKey

        if (!privateKeyBytes) {
            throw new Error('Failed to derive private key')
        }

        return {
            privateKey: toHex(privateKeyBytes),
            address: account.address,
        }
    }

    async importWalletFromPrivateKey(
        privateKey: string
    ): Promise<EvmImportedWallet> {
        let cleanKey = privateKey.trim()
        if (!cleanKey.startsWith('0x')) {
            cleanKey = `0x${cleanKey}`
        }
        const account = privateKeyToAccount(cleanKey as Hex)
        return {
            privateKey: cleanKey as Hex,
            address: account.address,
        }
    }
}