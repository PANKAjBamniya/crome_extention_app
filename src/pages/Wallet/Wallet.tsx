import React, { useEffect, useState } from 'react'
import {
    Copy,
    Eye,
    EyeOff,
    Send,
    ArrowDownToLine,
    Repeat2,
    Wallet as WalletIcon,
    Settings,
    Globe,
    DollarSign,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../../store'
import { setWalletAddress, setAccounts } from '../../store/slices/walletSlice'
import { getWalletAddress, getStoredAccounts } from '../../services/walletVault'
import HomeHeader from '../../components/Header/HomeHeader'
import type { AccountItem } from '../../store/slices/walletSlice'
import { truncateEnd } from '../../utils/helpers'
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
    const [copied, setCopied] = useState(false)
    const [isNetworkSheetOpen, setIsNetworkSheetOpen] = useState(false);
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
    const accounts = reduxAccounts.length > 0 ? reduxAccounts : storedAccounts
    const displayAddress = walletAddress ? truncateEnd(walletAddress, 10) : '—'

    const { assets, isLoading, nativeBalance, deleteCustomToken } = useAssets(
        activeNetwork,
        walletAddress
    )


    return (
        <div className="relative h-screen w-full overflow-hidden bg-black text-white">

            <div className="mx-auto flex h-full w-full max-w-md flex-col">
                <HomeHeader
                    address={walletAddress}
                    walletName={walletName}
                    activeNetwork={activeNetwork}
                    onAccountClick={() => navigate('/accounts')}
                    onNetworkClick={() => setIsNetworkSheetOpen(true)}
                    onSettingsClick={() => navigate('/settings')}
                />
                <main className="flex-1 overflow-y-auto px-5 pb-6">
                    <div className="mt-3 rounded-2xl border border-[#293C0D] bg-[#050900] p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                                Total Balance
                            </p>

                            <button
                                type="button"
                                onClick={() => setShowBalance(prev => !prev)}
                                className="text-gray-500 hover:text-white"
                            >
                                {showBalance ? (
                                    <Eye size={17} />
                                ) : (
                                    <EyeOff size={17} />
                                )}
                            </button>

                        </div>

                        <p className="mt-2 text-3xl font-bold tracking-tight">
                            {showBalance
                                ? `${nativeBalance} ${activeNetwork.symbol}`
                                : '••••••'}
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                                Portfolio
                            </span>

                            <span className="text-xs text-[#C7F11D]">
                                +0.00%
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="mt-5 flex justify-between gap-3">

                            <button
                                type="button"
                                className="flex flex-col items-center gap-1"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C7F11D]">
                                    <Send
                                        size={18}
                                        className="text-black"
                                    />
                                </div>

                                <span className="text-xs font-medium">
                                    Send
                                </span>
                            </button>

                            <button
                                type="button"
                                className="flex flex-col items-center gap-1"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C7F11D]">
                                    <ArrowDownToLine
                                        size={18}
                                        className="text-black"
                                    />
                                </div>

                                <span className="text-xs font-medium">
                                    Receive
                                </span>
                            </button>

                            <button
                                type="button"
                                className="flex flex-col items-center gap-1"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C7F11D]">
                                    <Repeat2
                                        size={18}
                                        className="text-black"
                                    />
                                </div>

                                <span className="text-xs font-medium">
                                    Swap
                                </span>
                            </button>

                            <button
                                type="button"
                                className="flex flex-col items-center gap-1"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C7F11D]">
                                    <DollarSign
                                        size={18}
                                        className="text-black"
                                    />
                                </div>

                                <span className="text-xs font-medium">
                                    Buy
                                </span>
                            </button>

                        </div>
                    </div>

                    {/* Assets */}
                    <div className="mt-7">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-sm font-semibold">
                                Assets
                            </h2>

                            <button
                                type="button"
                                onClick={() => navigate('/assets')}
                                className="text-[10px] text-[#C7F11D] hover:underline"
                            >
                                View all
                            </button>
                        </div>

                        <AssetList
                            assets={assets}
                            isLoading={isLoading}
                            showBalance={showBalance}
                            onDelete={deleteCustomToken}
                        />

                        <div className="mt-3">
                            <AddTokenButton
                                onClick={() => navigate('/import-token')}
                            />
                        </div>
                    </div>
                </main>

                <div className="shrink-0 border-t border-white/5 bg-black px-5 pb-5 pt-3">
                    <div className="grid grid-cols-3">
                        <button
                            type="button"
                            className="flex flex-col items-center gap-1 text-[#C7F11D]"
                        >
                            <WalletIcon size={19} />

                            <span className="text-[9px]">
                                Wallet
                            </span>
                        </button>

                        <button
                            type="button"
                            className="flex flex-col items-center gap-1 text-gray-500 hover:text-white"
                        >
                            <Globe size={19} />

                            <span className="text-[9px]">
                                Browser
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/settings')}
                            className="flex flex-col items-center gap-1 text-gray-500 hover:text-white"
                        >
                            <Settings size={19} />

                            <span className="text-[9px]">
                                Settings
                            </span>
                        </button>

                    </div>

                </div>

            </div>

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
