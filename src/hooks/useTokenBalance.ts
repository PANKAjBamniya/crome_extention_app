import { useState, useEffect, useCallback } from 'react'
import type { EVMNetwork } from '../config/networks'
import { getTokenBalance } from '../services/token/erc20'
import { formatTokenAmount } from '../utils/token/formatTokenAmount'

interface UseTokenBalanceResult {
    balance: string
    rawBalance: bigint
    isLoading: boolean
    error: string | null
    refetch: () => Promise<void>
}

/**
 * Hook to fetch the balance of an individual ERC-20 token.
 */
export const useTokenBalance = (
    network: EVMNetwork,
    tokenAddress: string,
    decimals: number,
    walletAddress: string | null
): UseTokenBalanceResult => {
    const [rawBalance, setRawBalance] = useState<bigint>(0n)
    const [balance, setBalance] = useState<string>('0.00')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const fetchBalance = useCallback(async () => {
        if (!walletAddress || !tokenAddress) {
            setRawBalance(0n)
            setBalance('0.00')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const raw = await getTokenBalance(network, tokenAddress, walletAddress)
            setRawBalance(raw)
            setBalance(formatTokenAmount(raw, decimals))
        } catch (err: any) {
            console.error(`Error fetching token balance for ${tokenAddress}:`, err)
            setError('Failed to fetch balance')
            setRawBalance(0n)
            setBalance('0.00')
        } finally {
            setIsLoading(false)
        }
    }, [network, tokenAddress, decimals, walletAddress])

    useEffect(() => {
        fetchBalance()
    }, [fetchBalance])

    return {
        balance,
        rawBalance,
        isLoading,
        error,
        refetch: fetchBalance,
    }
}

export default useTokenBalance

