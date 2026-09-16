import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
} from 'lucide-react'
import BottomSheet from '../../BottomSheet'

export interface AccountItem {
    address: string
    walletName: string
}

interface AccountBottomSheetProps {
    isOpen: boolean
    onClose: () => void
    activeAddress: string | null
    activeWalletName?: string
    accounts: AccountItem[]
    onSelectAccount: (account: AccountItem) => void
}

const formatAddress = (addr: string): string => {
    if (!addr) return ''
    if (addr.length <= 13) return addr
    return `${addr.slice(0, 7)}...${addr.slice(-5)}`
}

const AccountBottomSheet: React.FC<AccountBottomSheetProps> = ({
    isOpen,
    onClose,
    activeAddress,
    activeWalletName = 'Account 1',
    accounts,
    onSelectAccount,
}) => {
    const navigate = useNavigate()
    const [showAddOptions, setShowAddOptions] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
    const [menuOpenAddress, setMenuOpenAddress] = useState<string | null>(null)

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

    const handleCreateWallet = () => {
        onClose()
        navigate('/create-wallet')
    }

    const handleImportWallet = () => {
        onClose()
        navigate('/import-wallet')
    }

    const handleClose = () => {
        setShowAddOptions(false)
        setSearchQuery('')
        setMenuOpenAddress(null)
        onClose()
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

    return (
        <BottomSheet
            visible={isOpen}
            onClose={handleClose}
            closeOnBackdropPress={true}
        >
            <div className="flex flex-col h-full" onClick={() => setMenuOpenAddress(null)}>
                <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
                    <div className="flex items-center gap-2">
                        {showAddOptions && (
                            <button
                                type="button"
                                onClick={() => setShowAddOptions(false)}
                                className="mr-1 rounded-lg p-1 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                            >
                                <ArrowLeft size={18} />
                            </button>
                        )}
                        <h2 className="text-base font-semibold text-white">
                            {showAddOptions ? 'Add Wallet' : 'Accounts'}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Close accounts sheet"
                        className="rounded-lg p-1 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {!showAddOptions ? (
                    <>
                        {/* Search Bar */}
                        <div className="my-3 relative flex items-center w-full rounded-full bg-[#18191B] border border-white/5 px-3.5 py-2 text-sm focus-within:border-white/20 transition-all">
                            <Search size={16} className="text-gray-400 shrink-0 mr-2.5" />
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
                        <div className="flex-1 space-y-2 overflow-y-auto pr-0.5 pb-2">
                            {filteredAccounts.length > 0 ? (
                                filteredAccounts.map((account) => {
                                    const isSelected =
                                        !!activeAddress &&
                                        account.address.toLowerCase() === activeAddress.toLowerCase()

                                    return (
                                        <div
                                            key={account.address}
                                            onClick={() => {
                                                onSelectAccount(account)
                                                onClose()
                                            }}
                                            className={`group flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all cursor-pointer ${isSelected
                                                ? 'border-[#C7F11D]/30 bg-[#18191B]'
                                                : 'border-white/5 bg-[#18191B] hover:border-white/20 hover:bg-white/[0.04]'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {/* Account/wallet icon on the left */}
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-800 to-indigo-900 border border-purple-500/20 text-purple-200 shadow-sm">
                                                    <Wallet size={20} />
                                                </div>

                                                {/* Account Name & Address */}
                                                <div className="min-w-0 flex flex-col items-start gap-1">
                                                    <div className="flex items-center gap-2 max-w-full">
                                                        <p className="truncate text-sm font-semibold text-white">
                                                            {account.walletName || 'Account 1'}
                                                        </p>
                                                        {isSelected && (
                                                            <span className="shrink-0 rounded-full bg-[#C7F11D]/15 px-2 py-0.5 text-[10px] font-semibold text-[#C7F11D]">
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Compact rounded address container with copy */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleCopy(e, account.address)}
                                                        title="Copy address"
                                                        className="inline-flex items-center gap-1.5 rounded-full bg-[#242528] border border-white/5 px-2.5 py-0.5 text-[11px] font-mono text-gray-300 hover:border-white/20 hover:text-white transition-colors cursor-pointer"
                                                    >
                                                        <span>{formatAddress(account.address)}</span>
                                                        {copiedAddress === account.address ? (
                                                            <Check size={11} className="text-[#C7F11D]" />
                                                        ) : (
                                                            <Copy size={11} className="text-gray-400 group-hover:text-gray-300" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Three-dot menu button on the right */}
                                            <div className="relative shrink-0 ml-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setMenuOpenAddress(
                                                            menuOpenAddress === account.address
                                                                ? null
                                                                : account.address
                                                        )
                                                    }}
                                                    aria-label="Account options"
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                {menuOpenAddress === account.address && (
                                                    <div
                                                        className="absolute right-0 top-9 z-50 min-w-[140px] rounded-xl border border-white/10 bg-[#1F2023] p-1 shadow-xl backdrop-blur-md"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                handleCopy(e, account.address)
                                                                setMenuOpenAddress(null)
                                                            }}
                                                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                                                        >
                                                            <Copy size={13} />
                                                            <span>Copy Address</span>
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
                            onClick={handleCreateWallet}
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
                            onClick={handleImportWallet}
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
            </div>
        </BottomSheet>
    )
}

export default AccountBottomSheet
