import type { Token } from '../../types/token'
import { createTokenId, normalizeAddress } from '../../utils/token/normalizeToken'
import { primeLogoCache } from './tokenLogoService'

/**
 * Supported token catalog by chain ID with verified metadata and logo URLs.
 * This is the available token catalog - it does NOT automatically become the user's active list.
 */
export const TOKEN_CATALOG: Record<number, Omit<Token, 'id' | 'isCustom' | 'createdAt'>[]> = {
    // Ethereum Mainnet (1)
    1: [
        {
            chainId: 1,
            address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            name: 'Tether USD',
            symbol: 'USDT',
            decimals: 6,
            logoUrl:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
        },
        {
            chainId: 1,
            address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            name: 'USD Coin',
            symbol: 'USDC',
            decimals: 6,
            logoUrl:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
        },
        {
            chainId: 1,
            address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            name: 'Dai Stablecoin',
            symbol: 'DAI',
            decimals: 18,
            logoUrl:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
        },
        {
            chainId: 1,
            address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
            name: 'Chainlink Token',
            symbol: 'LINK',
            decimals: 18,
            logoUrl:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png',
        },
    ],

    // Polygon Mainnet (137)
    137: [
        {
            chainId: 137,
            address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
            name: 'Tether USD',
            symbol: 'USDT',
            decimals: 6,
            logoUrl:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0xc2132D05D31c914a87C6611C10748AEb04B58e8F/logo.png',
        },
        {
            chainId: 137,
            address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
            name: 'USD Coin',
            symbol: 'USDC',
            decimals: 6,
            logoUrl:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359/logo.png',
        },
        {
            chainId: 137,
            address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
            name: 'Dai Stablecoin',
            symbol: 'DAI',
            decimals: 18,
            logoUrl:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063/logo.png',
        },
    ],

    // BNB Smart Chain (56)
    56: [
        {
            chainId: 56,
            address: '0x55d398326f99059fF775485246999027B3197955',
            name: 'Tether USD',
            symbol: 'USDT',
            decimals: 18,
            logoUrl:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x55d398326f99059fF775485246999027B3197955/logo.png',
        },
        {
            chainId: 56,
            address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
            name: 'USD Coin',
            symbol: 'USDC',
            decimals: 18,
            logoUrl:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d/logo.png',
        },
        {
            chainId: 56,
            address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
            name: 'BUSD Token',
            symbol: 'BUSD',
            decimals: 18,
            logoUrl:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56/logo.png',
        },
    ],

    // Arbitrum One (42161)
    42161: [
        {
            chainId: 42161,
            address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
            name: 'Tether USD',
            symbol: 'USDT',
            decimals: 6,
            logoUrl:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9/logo.png',
        },
        {
            chainId: 42161,
            address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            name: 'USD Coin',
            symbol: 'USDC',
            decimals: 6,
            logoUrl:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xaf88d065e77c8cC2239327C5EDb3A432268e5831/logo.png',
        },
        {
            chainId: 42161,
            address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
            name: 'Dai Stablecoin',
            symbol: 'DAI',
            decimals: 18,
            logoUrl:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1/logo.png',
        },
    ],

    // Sepolia (11155111)
    11155111: [
        {
            chainId: 11155111,
            address: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
            name: 'Chainlink Token',
            symbol: 'LINK',
            decimals: 18,
            logoUrl:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png',
        },
    ],
}

/**
 * Supported token catalog containing all predefined tokens.
 * This catalog does NOT automatically appear in the user's active token list.
 */
export const SUPPORTED_TOKEN_CATALOG = TOKEN_CATALOG

/**
 * Backward compatibility alias for TOKEN_CATALOG.
 */
export const BUILT_IN_TOKENS = TOKEN_CATALOG

/**
 * Default active ERC-20 tokens for a fresh wallet installation.
 * By default, only each network's native token is active.
 * ERC-20 tokens only become active when explicitly imported or added by the user.
 */
export const DEFAULT_ACTIVE_TOKENS: Token[] = []

/**
 * Returns catalog tokens for a specific chain, pre-populating logo cache.
 */
export const getCatalogTokens = (chainId: number): Token[] => {
    const list = TOKEN_CATALOG[chainId] || []
    return list.map((item) => {
        const address = normalizeAddress(item.address)
        if (item.logoUrl) {
            primeLogoCache(chainId, address, item.logoUrl)
        }
        return {
            ...item,
            address,
            id: createTokenId(chainId, address),
            isCustom: false,
            createdAt: 0,
        }
    })
}

/**
 * Backward compatibility alias for getCatalogTokens.
 */
export const getBuiltInTokens = getCatalogTokens

/**
 * Checks if a contract address on a chain is in the predefined token catalog.
 */
export const isCatalogToken = (chainId: number, address: string): boolean => {
    const cleanAddress = normalizeAddress(address)
    const catalog = getCatalogTokens(chainId)
    return catalog.some((t) => normalizeAddress(t.address) === cleanAddress)
}

/**
 * Backward compatibility alias for isCatalogToken.
 */
export const isBuiltInToken = isCatalogToken

/**
 * Returns all tokens in the catalog across all supported chains.
 */
export const getAllCatalogTokens = (): Token[] => {
    const chainIds = Object.keys(TOKEN_CATALOG).map(Number)
    const all: Token[] = []
    for (const chainId of chainIds) {
        all.push(...getCatalogTokens(chainId))
    }
    return all
}

/**
 * Backward compatibility alias for getAllCatalogTokens.
 */
export const getAllBuiltInTokens = getAllCatalogTokens
