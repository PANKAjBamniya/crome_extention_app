import type { EVMNetwork } from '../../config/networks'
import { getEVMClient } from '../blockchain/evmClient'

export const ERC20_ABI = [
    {
        name: 'name',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                type: 'string',
            },
        ],
    },
    {
        name: 'symbol',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                type: 'string',
            },
        ],
    },
    {
        name: 'decimals',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                type: 'uint8',
            },
        ],
    },
    {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            {
                name: 'account',
                type: 'address',
            },
        ],
        outputs: [
            {
                type: 'uint256',
            },
        ],
    },
] as const

export interface TokenMetadata {
    name: string
    symbol: string
    decimals: number
}

/**
 * Reads token metadata (name, symbol, decimals) directly from the ERC-20 contract.
 * Never assumes 18 decimals; reads contract decimals().
 */
export const getTokenMetadata = async (
    network: EVMNetwork,
    contractAddress: string
): Promise<TokenMetadata> => {
    try {
        const client = getEVMClient(network)
        const address = contractAddress as `0x${string}`

        const [name, symbol, decimals] = await Promise.all([
            client.readContract({
                address,
                abi: ERC20_ABI,
                functionName: 'name',
            }),
            client.readContract({
                address,
                abi: ERC20_ABI,
                functionName: 'symbol',
            }),
            client.readContract({
                address,
                abi: ERC20_ABI,
                functionName: 'decimals',
            }),
        ])

        return {
            name: String(name),
            symbol: String(symbol),
            decimals: Number(decimals),
        }
    } catch (err: any) {
        console.error('Failed to read ERC-20 token metadata:', err)
        throw new Error(
            'Unable to read token information. Please verify the contract address and network.'
        )
    }
}

/**
 * Reads the token balance for a specific wallet address from an ERC-20 contract.
 */
export const getTokenBalance = async (
    network: EVMNetwork,
    contractAddress: string,
    walletAddress: string
): Promise<bigint> => {
    try {
        const client = getEVMClient(network)
        const balance = await client.readContract({
            address: contractAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [walletAddress as `0x${string}`],
        })

        return BigInt(balance as bigint)
    } catch (err) {
        console.error(`Failed to fetch ERC-20 balance for ${contractAddress}:`, err)
        return 0n
    }
}