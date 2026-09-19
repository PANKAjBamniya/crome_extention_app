import type { TokenTransactionItem } from '../../types/tokenDetails'
import { getNetworkByChainId, EVM_NETWORKS } from '../../config/networks'

/**
 * Generates sample transaction history for a given token and wallet address.
 * If user has no balance, returns an empty array to showcase the clean empty state.
 */
export const getTokenTransactions = async (
    chainId: number,
    tokenSymbol: string,
    userBalance: string
): Promise<TokenTransactionItem[]> => {
    // Simulate slight network delay for natural feel
    await new Promise((resolve) => setTimeout(resolve, 250))

    const numBalance = parseFloat(userBalance.replace(/[^0-9.-]+/g, '')) || 0
    if (numBalance <= 0) {
        return []
    }

    const network = getNetworkByChainId(chainId) || EVM_NETWORKS[0]
    const now = Date.now()

    return [
        {
            id: `tx-1-${tokenSymbol}`,
            type: 'receive',
            amount: `+${userBalance}`,
            symbol: tokenSymbol,
            fiatValue: '$0.00',
            fromAddress: '0x71C...49b8',
            timestamp: now - 3600000 * 4,
            formattedDate: 'Today, 2:15 PM',
            status: 'completed',
            hash: '0x8f3c7...9a21',
            explorerUrl: `${network.explorerUrl}/tx/0x8f3c7ad23cd3cadbd9735aff958023239c6a063`,
        },
    ]
}

