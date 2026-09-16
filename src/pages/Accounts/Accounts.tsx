import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
    X,
    Plus,
    ChevronRight,
    ArrowLeft,
    Search,
    Copy,
    Check,
    MoreVertical,
    Wallet,
    Pencil,
} from 'lucide-react'
import type { RootState, AppDispatch } from '../../store'
import {
    setWalletAddress,
    setAccounts,
    type AccountItem,
} from '../../store/slices/walletSlice'
import {
    getWalletAddress,
    getStoredAccounts,
    setActiveAccount,
} from '../../services/walletVault'
import { updateWallet, getWallet, getWallets } from '../../services/walletStorage'

export type { AccountItem }

const formatAddress = (addr: string): string => {
    if (!addr) return ''
    if (addr.length <= 13) return addr
    return `${addr.slice(0, 7)}...${addr.slice(-5)}`
}

export const Accounts: React.FC = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    const reduxAddress = useSelector((state: RootState) => state.wallet.address)
    const reduxWalletName = useSelector(
        (state: RootState) => state.wallet.walletName
    )
    const reduxAccounts = useSelector(
        (state: RootState) => state.wallet.accounts
    )

    const [storedAddress, setStoredAddress] = useState<string | null>(null)
    const [storedWalletName, setStoredWalletName] = useState<string>('Account 1')
    const [storedAccounts, setStoredAccounts] = useState<AccountItem[]>([])

    const [showAddOptions, setShowAddOptions] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
    const [menuOpenAddress, setMenuOpenAddress] = useState<string | null>(null)
    const [editingAccount, setEditingAccount] = useState<AccountItem | null>(null)
    const [editNameInput, setEditNameInput] = useState('')

    useEffect(() => {
        Promise.all([getWalletAddress(), getStoredAccounts()]).then(
            ([{ address, walletName }, accounts]) => {
                if (address) {
                    setStoredAddress(address)
                    setStoredWalletName(walletName)
                    dispatch(setWalletAddress({ address, walletName }))
                }
                if (accounts.length > 0) {
                    setStoredAccounts(accounts)
                    dispatch(setAccounts(accounts))
                }
            }
        )
    }, [dispatch])

    const activeAddress = reduxAddress ?? storedAddress
    const activeWalletName = reduxWalletName ?? storedWalletName
    const accounts =
        reduxAccounts.length > 0 ? reduxAccounts : storedAccounts

    const accountList: AccountItem[] =
        accounts.length > 0
            ? accounts
            : activeAddress
                ? [{ address: activeAddress, walletName: activeWalletName }]
                : []

    const filteredAccounts = accountList.filter((account) => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return true
        return (
            (account.walletName || '').toLowerCase().includes(query) ||
            account.address.toLowerCase().includes(query)
        )
    })

    const handleSelectAccount = async (account: AccountItem) => {
        await setActiveAccount(account.address, account.walletName)
        setStoredAddress(account.address)
        setStoredWalletName(account.walletName)
        dispatch(
            setWalletAddress({
                address: account.address,
                walletName: account.walletName,
            })
        )
        navigate('/wallet', { replace: true })
    }

    const handleCopy = async (e: React.MouseEvent, address: string) => {
        e.stopPropagation()
        try {
            await navigator.clipboard.writeText(address)
            setCopiedAddress(address)
            setTimeout(() => setCopiedAddress(null), 1500)
        } catch (err) {
            console.error('Failed to copy address:', err)
        }
    }

    const handleSaveEditName = async () => {
        if (!editingAccount || !editNameInput.trim()) return

        const newName = editNameInput.trim()
        const updatedAccounts = accounts.map((acc) =>
            acc.address.toLowerCase() === editingAccount.address.toLowerCase()
                ? { ...acc, walletName: newName }
                : acc
        )

        dispatch(setAccounts(updatedAccounts))
        setStoredAccounts(updatedAccounts)

        // If this is the active account, update active name as well
        if (
            activeAddress &&
            activeAddress.toLowerCase() === editingAccount.address.toLowerCase()
        ) {
            setStoredWalletName(newName)
            dispatch(
                setWalletAddress({
                    address: activeAddress,
                    walletName: newName,
                })
            )
            await setActiveAccount(activeAddress, newName)
        }

        // Update in stored wallet object
        try {
            const stored = await getStoredAccounts()
            const match = stored.find(
                (w) => w.address.toLowerCase() === editingAccount.address.toLowerCase()
            )
            if (match) {
                // Find wallet by address
                const allWallets = await getWallets()
                const target = allWallets.find(
                    (w) =>
                        w.address.toLowerCase() ===
                        editingAccount.address.toLowerCase()
                )
                if (target) {
                    await updateWallet({
                        ...target,
                        name: newName,
                        walletName: newName,
                    })
                }
            }
        } catch (err) {
            console.error('Failed to update wallet name in storage:', err)
        }

        setEditingAccount(null)
        setEditNameInput('')
    }

    return (
        <div
            className="relative h-screen w-full overflow-hidden bg-black text-white"
            onClick={() => setMenuOpenAddress(null)}
        >
            {/* Background Glow */}
            <div
                className="
                    pointer-events-none
                    absolute
                    left-1/2
                    top-1/2
                    h-[320px]
                    w-[320px]
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-[#C7F11D]
                    opacity-[0.035]
                    blur-[100px]
                "
            />

            <div className="relative mx-auto flex h-full w-full max-w-md flex-col">
                {/* Header */}
                <div className="shrink-0 flex items-center justify-between border-b border-white/10 px-5 pt-4 pb-3">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                if (showAddOptions) {
                                    setShowAddOptions(false)
                                } else {
                                    navigate('/wallet', { replace: true })
                                }
                            }}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                            aria-label="Back"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <h1 className="text-base font-semibold text-white">
                            {showAddOptions ? 'Add Wallet' : 'Accounts'}
                        </h1>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/wallet', { replace: true })}
                        aria-label="Close"
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto px-5 pb-6">
                    {!showAddOptions ? (
                        <>
                            {/* Search Bar */}
                            <div className="my-3 relative flex items-center w-full rounded-full bg-[#18191B] border border-white/5 px-3.5 py-2 text-sm focus-within:border-white/20 transition-all">
                                <Search
                                    size={16}
                                    className="text-gray-400 shrink-0 mr-2.5"
                                />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search your accounts"
                                    className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="text-gray-400 hover:text-white p-0.5 cursor-pointer"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Accounts List */}
                            <div className="space-y-2 pb-2">
                                {filteredAccounts.length > 0 ? (
                                    filteredAccounts.map((account) => {
                                        const isSelected =
                                            !!activeAddress &&
                                            account.address.toLowerCase() ===
                                            activeAddress.toLowerCase()

                                        return (
                                            <div
                                                key={account.address}
                                                onClick={() =>
                                                    handleSelectAccount(account)
                                                }
                                                className={`group flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all cursor-pointer ${isSelected
                                                        ? 'border-[#C7F11D]/30 bg-[#18191B]'
                                                        : 'border-white/5 bg-[#18191B] hover:border-white/20 hover:bg-white/[0.04]'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-800 to-indigo-900 border border-purple-500/20 text-purple-200 shadow-sm">
                                                        <Wallet size={20} />
                                                    </div>

                                                    <div className="min-w-0 flex flex-col items-start gap-1">
                                                        <div className="flex items-center gap-2 max-w-full">
                                                            <p className="truncate text-sm font-semibold text-white">
                                                                {account.walletName ||
                                                                    'Account 1'}
                                                            </p>
                                                            {isSelected && (
                                                                <span className="shrink-0 rounded-full bg-[#C7F11D]/15 px-2 py-0.5 text-[10px] font-semibold text-[#C7F11D]">
                                                                    Active
                                                                </span>
                                                            )}
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={(e) =>
                                                                handleCopy(
                                                                    e,
                                                                    account.address
                                                                )
                                                            }
                                                            title="Copy address"
                                                            className="inline-flex items-center gap-1.5 rounded-full bg-[#242528] border border-white/5 px-2.5 py-0.5 text-[11px] font-mono text-gray-300 hover:border-white/20 hover:text-white transition-colors cursor-pointer"
                                                        >
                                                            <span>
                                                                {formatAddress(
                                                                    account.address
                                                                )}
                                                            </span>
                                                            {copiedAddress ===
                                                                account.address ? (
                                                                <Check
                                                                    size={11}
                                                                    className="text-[#C7F11D]"
                                                                />
                                                            ) : (
                                                                <Copy
                                                                    size={11}
                                                                    className="text-gray-400 group-hover:text-gray-300"
                                                                />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="relative shrink-0 ml-2">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setMenuOpenAddress(
                                                                menuOpenAddress ===
                                                                    account.address
                                                                    ? null
                                                                    : account.address
                                                            )
                                                        }}
                                                        aria-label="Account options"
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>

                                                    {menuOpenAddress ===
                                                        account.address && (
                                                            <div
                                                                className="absolute right-0 top-9 z-50 min-w-[140px] rounded-xl border border-white/10 bg-[#1F2023] p-1 shadow-xl backdrop-blur-md"
                                                                onClick={(e) =>
                                                                    e.stopPropagation()
                                                                }
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditingAccount(
                                                                            account
                                                                        )
                                                                        setEditNameInput(
                                                                            account.walletName ||
                                                                            ''
                                                                        )
                                                                        setMenuOpenAddress(
                                                                            null
                                                                        )
                                                                    }}
                                                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                                                                >
                                                                    <Pencil size={13} />
                                                                    <span>Edit</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="py-6 text-center text-xs text-gray-500">
                                        No accounts found matching "{searchQuery}"
                                    </div>
                                )}

                                {/* Add account action */}
                                <button
                                    type="button"
                                    onClick={() => setShowAddOptions(true)}
                                    className="flex items-center gap-3 w-full p-2 mt-1 rounded-xl text-left transition-colors hover:bg-white/[0.04] cursor-pointer group"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#162038] border border-[#263760] text-[#5B8BF5] group-hover:bg-[#1C2947] transition-colors">
                                        <Plus size={16} />
                                    </div>
                                    <span className="text-sm font-semibold text-[#5B8BF5] group-hover:text-[#759EFA] transition-colors">
                                        Add account
                                    </span>
                                </button>
                            </div>
                        </>
                    ) : (
                        /* Add Wallet Options */
                        <div className="my-3 space-y-2">
                            <button
                                type="button"
                                onClick={() => navigate('/create-wallet')}
                                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#18191B] p-3 text-left transition-all hover:border-[#C7F11D]/40 hover:bg-white/[0.04]"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        Create New Wallet
                                    </p>
                                    <p className="mt-0.5 text-xs text-gray-400">
                                        Generate a new 12-word recovery phrase
                                    </p>
                                </div>
                                <ChevronRight size={16} className="text-gray-400" />
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/import-wallet')}
                                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#18191B] p-3 text-left transition-all hover:border-[#C7F11D]/40 hover:bg-white/[0.04]"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        Import Existing Wallet
                                    </p>
                                    <p className="mt-0.5 text-xs text-gray-400">
                                        Restore with recovery phrase or private key
                                    </p>
                                </div>
                                <ChevronRight size={16} className="text-gray-400" />
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {/* Edit Account Modal */}
            {editingAccount && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"
                    onClick={() => setEditingAccount(null)}
                >
                    <div
                        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#18191B] p-5 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-base font-semibold text-white">
                            Edit Account Name
                        </h2>
                        <p className="mt-1 text-xs text-gray-400">
                            Enter a new display name for this account.
                        </p>

                        <input
                            type="text"
                            value={editNameInput}
                            onChange={(e) => setEditNameInput(e.target.value)}
                            placeholder="Account name"
                            autoFocus
                            className="mt-4 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#C7F11D]"
                        />

                        <div className="mt-5 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setEditingAccount(null)}
                                className="rounded-xl px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveEditName}
                                disabled={!editNameInput.trim()}
                                className="rounded-xl bg-[#C7F11D] px-4 py-2 text-xs font-semibold text-black hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Accounts
