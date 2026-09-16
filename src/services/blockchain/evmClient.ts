import { createPublicClient, http } from 'viem'
import type { EVMNetwork } from '../../config/networks'

export const getEVMClient = (network: EVMNetwork) => {
    return createPublicClient({
        transport: http(network.rpcUrl),
    })
}