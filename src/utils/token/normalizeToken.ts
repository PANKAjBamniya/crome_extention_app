/**
 * Normalizes an EVM address to lowercase trimmed string for consistent lookups and comparisons.
 */
export const normalizeAddress = (address: string): string => {
    if (!address) return ''
    return address.trim().toLowerCase()
}

/**
 * Generates a unique, deterministic token identifier based on chain ID and normalized contract address.
 * Example: "1:0xdac17f958d2ee523a2206206994597c13d831ec7"
 */
export const createTokenId = (chainId: number, address: string): string => {
    return `${chainId}:${normalizeAddress(address)}`
}

/**
 * Checks if two tokens represent the same contract on the same network.
 */
export const isSameToken = (
    tokenA: { chainId: number; address: string },
    tokenB: { chainId: number; address: string }
): boolean => {
    return (
        tokenA.chainId === tokenB.chainId &&
        normalizeAddress(tokenA.address) === normalizeAddress(tokenB.address)
    )
}

