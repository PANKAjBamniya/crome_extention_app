import React, { useEffect, useState, useMemo } from 'react'
import {
    Eye,
    EyeOff,
    Send,
    ArrowDownToLine,
    Repeat2,
    DollarSign,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../../store'
import { setWalletAddress, setAccounts } from '../../store/slices/walletSlice'
import { getWalletAddress, getStoredAccounts } from '../../services/walletVault'
import HomeHeader from '../../components/Header/HomeHeader'
import type { AccountItem } from '../../store/slices/walletSlice'
import {
    EVM_NETWORKS,
    type EVMNetwork,
} from '../../config/networks'
import { getActiveNetworkId, setActiveNetworkId } from '../../services/walletStorage'
import SelectNetworkSheet from '../../components/sheets/SelectNetworkSheet/SelectNetworkSheet'
import { useAssets } from '../../hooks/useAssets'
import AssetList from '../../components/assets/AssetList'
import AddTokenButton from '../../components/assets/AddTokenButton'

const Wallet = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    const [showBalance, setShowBalance] = useState(true)
    const [isNetworkSheetOpen, setIsNetworkSheetOpen] = useState(false)
    const [activeNetwork, setActiveNetwork] = useState<EVMNetwork>(
        EVM_NETWORKS[0]
    )
    const reduxAddress = useSelector(
        (state: RootState) => state.wallet.address
    )
    const reduxWalletName = useSelector(
        (state: RootState) => state.wallet.walletName
    )
    const reduxAccounts = useSelector(
        (state: RootState) => state.wallet.accounts
    )

    const [storedAddress, setStoredAddress] = useState<string | null>(null)
    const [storedWalletName, setStoredWalletName] = useState<string>('Account 1')
    const [storedAccounts, setStoredAccounts] = useState<AccountItem[]>([])

    useEffect(() => {
        Promise.all([getWalletAddress(), getStoredAccounts(), getActiveNetworkId()]).then(([{ address, walletName }, accounts, savedNetworkId]) => {
            if (address) {
                setStoredAddress(address)
                setStoredWalletName(walletName)
                dispatch(setWalletAddress({ address, walletName }))
            }
            if (accounts.length > 0) {
                setStoredAccounts(accounts)
                dispatch(setAccounts(accounts))
            }
            if (savedNetworkId) {
                const found = EVM_NETWORKS.find((n) => n.id === savedNetworkId)
                if (found) {
                    setActiveNetwork(found)
                }
            }
        })
    }, [dispatch])

    const walletAddress = reduxAddress ?? storedAddress
    const walletName = reduxWalletName ?? storedWalletName

    const { assets, isLoading, nativeBalance, deleteCustomToken } = useAssets(
        activeNetwork,
        walletAddress
    )

    // Calculate aggregated USD value from tokens
    const totalUsdValue = useMemo(() => {
        let total = 0
        assets.forEach((a) => {
            if (a.value) {
                const numeric = parseFloat(a.value.replace(/[^0-9.-]+/g, ''))
                if (!isNaN(numeric)) {
                    total += numeric
                }
            }
        })
        return `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }, [assets])

    // Maximum 5 assets on Home
    const displayedAssets = useMemo(() => assets.slice(0, 5), [assets])

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black text-[#FCFAF9]">
            <div className="mx-auto flex h-full w-full max-w-md flex-col">
                {/* Header */}
                <HomeHeader
                    address={walletAddress}
                    walletName={walletName}
                    activeNetwork={activeNetwork}
                    onAccountClick={() => navigate('/accounts')}
                    onNetworkClick={() => setIsNetworkSheetOpen(true)}
                    onSettingsClick={() => navigate('/settings')}
                />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto px-5 pb-6 space-y-6">
                    {/* BALANCE SECTION */}
                    <div className="pt-5 text-center flex flex-col items-center">
                        <div className="flex items-center justify-center gap-1.5">
                            <span className="text-[11px] font-medium tracking-wider uppercase text-[#5E5E5E]">
                                Net Portfolio Value
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowBalance(prev => !prev)}
                                className="text-[#5E5E5E] hover:text-[#FCFAF9] transition-colors p-0.5 cursor-pointer"
                                aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                            >
                                {showBalance ? (
                                    <Eye size={14} />
                                ) : (
                                    <EyeOff size={14} />
                                )}
                            </button>
                        </div>

                        {/* Large Balance Value */}
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#FCFAF9]">
                            {showBalance
                                ? `${nativeBalance} ${activeNetwork.symbol}`
                                : '••••••••'}
                        </h1>

                        {/* USD Value & 24h Change */}
                        <div className="mt-1.5 flex items-center justify-center gap-2">
                            <span className="text-sm font-medium text-[#5E5E5E]">
                                {showBalance ? totalUsdValue : '••••'}
                            </span>
                            <span className="text-xs font-semibold text-[#48E5C2]">
                                +0.00%
                            </span>
                        </div>
                    </div>

                    {/* ACTION SECTION */}
                    <div className="grid grid-cols-4 gap-2.5">
                        <button
                            type="button"
                            className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-[#5E5E5E]/25 bg-black py-3 px-1 transition-all hover:border-[#48E5C2] hover:bg-[#48E5C2]/10 cursor-pointer"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#48E5C2]/10 text-[#48E5C2] transition-colors group-hover:bg-[#48E5C2]/20">
                                <Send size={18} />
                            </div>
                            <span className="text-xs font-medium text-[#FCFAF9]">
                                Send
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/receive')}
                            className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-[#5E5E5E]/25 bg-black py-3 px-1 transition-all hover:border-[#48E5C2] hover:bg-[#48E5C2]/10 cursor-pointer"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#48E5C2]/10 text-[#48E5C2] transition-colors group-hover:bg-[#48E5C2]/20">
                                <ArrowDownToLine size={18} />
                            </div>
                            <span className="text-xs font-medium text-[#FCFAF9]">
                                Receive
                            </span>
                        </button>

                        <button
                            type="button"
                            className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-[#5E5E5E]/25 bg-black py-3 px-1 transition-all hover:border-[#48E5C2] hover:bg-[#48E5C2]/10 cursor-pointer"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#48E5C2]/10 text-[#48E5C2] transition-colors group-hover:bg-[#48E5C2]/20">
                                <Repeat2 size={18} />
                            </div>
                            <span className="text-xs font-medium text-[#FCFAF9]">
                                Swap
                            </span>
                        </button>

                        <button
                            type="button"
                            className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-[#5E5E5E]/25 bg-black py-3 px-1 transition-all hover:border-[#48E5C2] hover:bg-[#48E5C2]/10 cursor-pointer"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#48E5C2]/10 text-[#48E5C2] transition-colors group-hover:bg-[#48E5C2]/20">
                                <DollarSign size={18} />
                            </div>
                            <span className="text-xs font-medium text-[#FCFAF9]">
                                Buy
                            </span>
                        </button>
                    </div>

                    {/* ASSETS SECTION */}
                    <div className="pt-2">
                        <div className="mb-2.5 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-[#FCFAF9]">
                                Assets
                            </h2>

                            <button
                                type="button"
                                onClick={() => navigate('/assets')}
                                className="text-xs font-medium text-[#48E5C2] hover:underline cursor-pointer"
                            >
                                View All
                            </button>
                        </div>

                        {/* Clean Asset List with subtle separators, maximum 5 items */}
                        <AssetList
                            assets={displayedAssets}
                            isLoading={isLoading}
                            showBalance={showBalance}
                            onDelete={deleteCustomToken}
                        />

                        {/* Minimal Add Token Button */}
                        <div className="mt-3">
                            <AddTokenButton
                                onClick={() => navigate('/import-token')}
                            />
                        </div>
                    </div>
                </main>
            </div>

            {/* Network Selector Modal */}
            <SelectNetworkSheet
                isOpen={isNetworkSheetOpen}
                onClose={() => setIsNetworkSheetOpen(false)}
                activeNetwork={activeNetwork}
                networks={EVM_NETWORKS}
                onSelectNetwork={(network) => {
                    setActiveNetwork(network)
                    setActiveNetworkId(network.id)
                }}
            />
        </div>
    )
}

export default Wallet
