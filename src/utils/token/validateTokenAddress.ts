import { isAddress } from 'viem'

/**
 * Validates that an input is a properly formatted EVM contract address.
 */
export const validateTokenAddress = (address: string): boolean => {
    if (!address || typeof address !== 'string') {
        return false
    }
    const trimmed = address.trim()
    return isAddress(trimmed)
}

export default validateTokenAddress

