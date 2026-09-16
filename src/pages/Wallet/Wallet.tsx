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
import { getWalletAddress, getStoredAccounts, setActiveAccount } from '../../services/walletVault'
import HomeHeader from '../../components/Header/HomeHeader'
import AccountBottomSheet, { AccountItem } from '../../components/sheets/AccountBottomSheet'
import { truncateEnd } from '../../utils/helpers'
import {
    EVM_NETWORKS,
    type EVMNetwork,
} from '../../config/networks'
import { getActiveNetworkId, setActiveNetworkId } from '../../services/walletStorage'
import SelectNetworkSheet from '../../components/sheets/SelectNetworkSheet/SelectNetworkSheet'
import { getEVMClient } from '../../services/blockchain/evmClient'
import { formatEther } from 'viem'

const Wallet = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    const [showBalance, setShowBalance] = useState(true)
    const [copied, setCopied] = useState(false)
    const [isAccountSheetOpen, setIsAccountSheetOpen] = useState(false)
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

    const handleSelectAccount = async (account: AccountItem) => {
        await setActiveAccount(account.address, account.walletName)
        setStoredAddress(account.address)
        setStoredWalletName(account.walletName)
        dispatch(setWalletAddress({ address: account.address, walletName: account.walletName }))
    }

    const assets = [
        {
            symbol: 'ETH',
            name: 'Ethereum',
            balance: '0.00 ETH',
            value: '$0.00',
        },
        {
            symbol: 'MST',
            name: 'MST Blockchain',
            balance: '0.00 MST',
            value: '$0.00',
        },
        {
            symbol: 'USDT',
            name: 'Tether USD',
            balance: '0.00 USDT',
            value: '$0.00',
        },
    ]


    const [nativeBalance, setNativeBalance] = useState('0.00')

    useEffect(() => {
        if (!walletAddress) return

        const loadBalance = async () => {
            try {
                const client = getEVMClient(activeNetwork)

                const balance = await client.getBalance({
                    address: walletAddress as `0x${string}`,
                })

                setNativeBalance(formatEther(balance))
            } catch (error) {
                console.error('Failed to fetch balance:', error)
                setNativeBalance('0.00')
            }
        }

        loadBalance()
    }, [walletAddress, activeNetwork])


    return (
        <div className="relative h-screen w-full overflow-hidden bg-black text-white">

            <div className="mx-auto flex h-full w-full max-w-md flex-col">
                <HomeHeader
                    address={walletAddress}
                    walletName={walletName}
                    activeNetwork={activeNetwork}
                    onAccountClick={() => setIsAccountSheetOpen(true)}
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
                                className="text-[10px] text-[#C7F11D]"
                            >
                                View all
                            </button>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0D0D0D]">

                            {assets.map((asset, index) => (
                                <button
                                    key={asset.symbol}
                                    type="button"
                                    className={`flex w-full items-center justify-between px-4 py-4 text-left hover:bg-white/[0.03] ${index !== assets.length - 1
                                        ? 'border-b border-white/5'
                                        : ''
                                        }`}
                                >

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#181818] text-xs font-bold text-[#C7F11D]">
                                            {asset.symbol.slice(0, 1)}
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold">
                                                {asset.name}
                                            </p>

                                            <p className="mt-1 text-[10px] text-gray-500">
                                                {asset.symbol}
                                            </p>
                                        </div>

                                    </div>

                                    <div className="text-right">
                                        <p className="text-xs font-medium">
                                            {showBalance
                                                ? asset.balance
                                                : '••••••'}
                                        </p>

                                        <p className="mt-1 text-[10px] text-gray-500">
                                            {showBalance
                                                ? asset.value
                                                : '••••'}
                                        </p>
                                    </div>

                                </button>
                            ))}

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

            <AccountBottomSheet
                isOpen={isAccountSheetOpen}
                onClose={() => setIsAccountSheetOpen(false)}
                activeAddress={walletAddress}
                activeWalletName={walletName}
                accounts={accounts}
                onSelectAccount={handleSelectAccount}
            />

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
