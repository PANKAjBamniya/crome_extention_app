import { arbitrumIcon, bnbIcon, ethereumIcon, polygonIcon } from "../assets"

export interface EVMNetwork {
    id: string
    name: string
    symbol: string
    chainId: number
    rpcUrl: string
    explorerUrl: string

    icon: string

    nativeCurrency: {
        name: string
        symbol: string
        decimals: number
    }
}
export const EVM_NETWORKS: EVMNetwork[] = [
    {
        id: 'ethereum',
        name: 'Ethereum',
        symbol: 'ETH',
        chainId: 1,
        rpcUrl: 'https://ethereum-rpc.publicnode.com',
        explorerUrl: 'https://etherscan.io',
        icon: ethereumIcon,
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        },
    },
    {
        id: 'polygon',
        name: 'Polygon',
        symbol: 'POL',
        chainId: 137,
        rpcUrl: 'https://polygon-bor-rpc.publicnode.com',
        explorerUrl: 'https://polygonscan.com',
        icon: polygonIcon,
        nativeCurrency: {
            name: 'POL',
            symbol: 'POL',
            decimals: 18,
        },
    },
    {
        id: 'bnb',
        name: 'BNB Smart Chain',
        symbol: 'BNB',
        chainId: 56,
        rpcUrl: 'https://bsc-rpc.publicnode.com',
        explorerUrl: 'https://bscscan.com',
        icon: bnbIcon,
        nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18,
        },
    },
    {
        id: 'arbitrum',
        name: 'Arbitrum One',
        symbol: 'ETH',
        chainId: 42161,
        rpcUrl: 'https://arbitrum-one-rpc.publicnode.com',
        explorerUrl: 'https://arbiscan.io',
        icon: arbitrumIcon,
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        },
    },
]