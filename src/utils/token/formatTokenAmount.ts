import { formatUnits } from 'viem'

/**
 * Formats a raw bigint balance using the token's decimal precision.
 * Safely handles arbitrary precision without JavaScript Number overflow.
 *
 * @param rawBalance - Raw balance as bigint (from balanceOf)
 * @param decimals - Token decimals (e.g. 18 for DAI, 6 for USDT)
 * @param maxDisplayDecimals - Maximum fraction digits to show (default: 4)
 * @returns Formatted human-readable string (e.g. "1.2345")
 */
export const formatTokenAmount = (
    rawBalance: bigint,
    decimals: number,
    maxDisplayDecimals = 4
): string => {
    if (rawBalance === 0n) {
        return '0.00'
    }

    try {
        const fullString = formatUnits(rawBalance, decimals)

        // If there's no decimal point, return with .00 or as is
        if (!fullString.includes('.')) {
            return `${fullString}.00`
        }

        const [whole, fraction] = fullString.split('.')

        // Truncate to maxDisplayDecimals without rounding errors
        let trimmedFraction = fraction.slice(0, maxDisplayDecimals)

        // Remove trailing zeroes, but keep at least 2 decimal places for neat UI
        trimmedFraction = trimmedFraction.replace(/0+$/, '')
        if (trimmedFraction.length < 2) {
            trimmedFraction = trimmedFraction.padEnd(2, '0')
        }

        return `${whole}.${trimmedFraction}`
    } catch {
        return '0.00'
    }
}

export default formatTokenAmount

