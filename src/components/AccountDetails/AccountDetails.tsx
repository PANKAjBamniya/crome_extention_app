import React, { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, X, Copy, Check, Wallet, Shield, Key, ChevronRight } from 'lucide-react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import type { AccountItem } from '../../store/slices/walletSlice'
import { useWalletManager } from '../../hook/useWalletManager'
import { getWallets } from '../../services/walletStorage'
import AccountNameSection from './AccountNameSection'
import DangerZoneSection from './DangerZoneSection'
import SecurityConfirmationModal from './SecurityConfirmationModal'
import PrivateKeyPage from './PrivateKeyPage'
import SecretRecoveryPhrasePage from './SecretRecoveryPhrasePage'

interface AccountDetailsProps {
    account: AccountItem
    onClose: () => void
    onAccountUpdated?: (updatedAccount: AccountItem) => void
    onAccountDeleted?: (deletedAddress: string) => void
}

type RevealTarget = 'privateKey' | 'srp' | null
type ViewMode = 'main' | 'privateKey' | 'srp'

export const AccountDetails: React.FC<AccountDetailsProps> = ({
    account,
    onClose,
    onAccountUpdated,
    onAccountDeleted,
}) => {
    const { revealAccountSecrets, removeAccount } = useWalletManager()
    const accounts = useSelector((state: RootState) => state.wallet.accounts)

    const [currentName, setCurrentName] = useState(account.walletName || 'Account 1')
    const [copiedAddress, setCopiedAddress] = useState(false)
    const [hasSrp, setHasSrp] = useState<boolean>(true)

    // View mode: 'main' | 'privateKey' | 'srp'
    const [currentView, setCurrentView] = useState<ViewMode>('main')

    // Security & revealed secrets state
    const [activeAuthTarget, setActiveAuthTarget] = useState<RevealTarget>(null)
    const [revealedPrivateKey, setRevealedPrivateKey] = useState<string | null>(null)
    const [revealedSrp, setRevealedSrp] = useState<string | null>(null)

    // Inspect stored wallet type on mount to check if SRP is supported
    useEffect(() => {
        let isMounted = true
        getWallets().then((wallets) => {
            if (!isMounted) return
            const target = wallets.find(
                (w) => w.address.toLowerCase() === account.address.toLowerCase()
            )
            if (target) {
                setHasSrp(target.type !== 'privateKey')
            }
        })
        return () => {
            isMounted = false
        }
    }, [account.address])

    // Cleanup sensitive data strictly on unmount
    useEffect(() => {
        return () => {
            setRevealedPrivateKey(null)
            setRevealedSrp(null)
            setActiveAuthTarget(null)
        }
    }, [])

    const handleCopyAddress = async () => {
        try {
            await navigator.clipboard.writeText(account.address)
            setCopiedAddress(true)
            setTimeout(() => setCopiedAddress(false), 2000)
        } catch {
            // Address copy failure handling
        }
    }

    const handleNameUpdated = (newName: string) => {
        setCurrentName(newName)
        onAccountUpdated?.({
            address: account.address,
            walletName: newName,
        })
    }

    const handleConfirmAuth = useCallback(
        async (pin: string): Promise<boolean> => {
            const target = activeAuthTarget
            const result = await revealAccountSecrets(account.address, pin)
            if (!result.success) {
                return false
            }

            if (target === 'privateKey') {
                if (result.privateKey) {
                    setRevealedPrivateKey(result.privateKey)
                    setCurrentView('privateKey')
                }
            } else if (target === 'srp') {
                if (result.seedPhrase) {
                    setRevealedSrp(result.seedPhrase)
                    setCurrentView('srp')
                }
            }

            setHasSrp(result.isMnemonic)
            setActiveAuthTarget(null)
            return true
        },
        [account.address, activeAuthTarget, revealAccountSecrets]
    )

    const handleRemoveAccount = async (): Promise<boolean> => {
        const result = await removeAccount(account.address)
        if (result.success) {
            onAccountDeleted?.(account.address)
            onClose()
            return true
        }
        return false
    }

    // ─── DEDICATED SUB-PAGE VIEWS ───
    if (currentView === 'privateKey') {
        return (
            <PrivateKeyPage
                account={{ address: account.address, walletName: currentName }}
                privateKey={revealedPrivateKey || undefined}
                onBack={() => {
                    setRevealedPrivateKey(null)
                    setCurrentView('main')
                }}
                onHide={() => {
                    setRevealedPrivateKey(null)
                    setCurrentView('main')
                }}
            />
        )
    }

    if (currentView === 'srp') {
        return (
            <SecretRecoveryPhrasePage
                account={{ address: account.address, walletName: currentName }}
                seedPhrase={revealedSrp || undefined}
                hasSrp={hasSrp}
                onBack={() => {
                    setRevealedSrp(null)
                    setCurrentView('main')
                }}
                onHide={() => {
                    setRevealedSrp(null)
                    setCurrentView('main')
                }}
            />
        )
    }

    // ─── MAIN ACCOUNT DETAILS VIEW ───
    const formattedAddress = `${account.address.slice(0, 10)}...${account.address.slice(-8)}`
    const isOnlyAccount = accounts.length <= 1

    return (
        <div className="fixed inset-0 z-40 flex h-full w-full flex-col bg-black text-[#FCFAF9]">
            {/* Background Glow */}
            <div
                className="
                    pointer-events-none
                    absolute
                    left-1/2
                    top-1/4
                    h-[300px]
                    w-[300px]
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-[#48E5C2]
                    opacity-[0.03]
                    blur-[100px]
                "
            />

            <div className="relative mx-auto flex h-full w-full max-w-md flex-col">
                {/* Header */}
                <div className="shrink-0 flex items-center justify-between border-b border-[#5E5E5E]/20 px-5 pt-4 pb-3">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-1.5 text-[#5E5E5E] hover:bg-[#5E5E5E]/10 hover:text-[#FCFAF9] transition-colors cursor-pointer"
                            aria-label="Back to Accounts"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <h1 className="text-base font-semibold text-[#FCFAF9]">
                            Account Details
                        </h1>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-[#5E5E5E] hover:bg-[#5E5E5E]/10 hover:text-[#FCFAF9] transition-colors cursor-pointer"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Main Scrollable Content */}
                <main className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    {/* Account Overview Card */}
                    <div className="flex flex-col items-center rounded-2xl border border-[#5E5E5E]/20 bg-black p-5 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#48E5C2]/30 bg-[#48E5C2]/10 text-[#48E5C2] shadow-lg">
                            <Wallet size={26} />
                        </div>
                        <h2 className="mt-3 text-base font-semibold text-[#FCFAF9]">
                            {currentName}
                        </h2>
                        <button
                            type="button"
                            onClick={handleCopyAddress}
                            className="mt-2 flex items-center gap-1.5 rounded-full border border-[#5E5E5E]/30 bg-black px-3 py-1.5 text-xs text-[#5E5E5E] transition-colors hover:border-[#48E5C2] hover:text-[#FCFAF9] active:scale-98 cursor-pointer"
                        >
                            <span className="font-mono">{formattedAddress}</span>
                            {copiedAddress ? (
                                <Check size={13} className="text-[#48E5C2]" />
                            ) : (
                                <Copy size={13} className="text-[#5E5E5E]" />
                            )}
                        </button>
                    </div>

                    {/* Section A: Account Name */}
                    <AccountNameSection
                        address={account.address}
                        currentName={currentName}
                        onNameUpdated={handleNameUpdated}
                    />

                    {/* Section C: Security Options */}
                    <div className="rounded-2xl border border-[#5E5E5E]/20 bg-black p-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-[#5E5E5E]/20">
                            <Shield size={15} className="text-[#48E5C2]" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#5E5E5E]">
                                Security
                            </span>
                        </div>

                        <div className="mt-3 space-y-2">
                            {/* Private Key Row */}
                            <button
                                type="button"
                                onClick={() => setActiveAuthTarget('privateKey')}
                                className="flex w-full items-center justify-between rounded-xl border border-[#5E5E5E]/20 bg-black p-3 text-left transition-all hover:border-[#5E5E5E]/40 hover:bg-[#5E5E5E]/5 active:scale-[0.99] cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#48E5C2]/30 bg-[#48E5C2]/10 text-[#48E5C2]">
                                        <Key size={17} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-[#FCFAF9] group-hover:text-[#48E5C2] transition-colors">
                                            Private Key
                                        </p>
                                        <p className="text-[11px] text-[#5E5E5E]">
                                            Reveal your private key
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-[#5E5E5E] group-hover:text-[#FCFAF9] transition-colors" />
                            </button>

                            {/* Secret Recovery Phrase Row (ONLY IF hasSrp is true) */}
                            {hasSrp && (
                                <button
                                    type="button"
                                    onClick={() => setActiveAuthTarget('srp')}
                                    className="flex w-full items-center justify-between rounded-xl border border-[#5E5E5E]/20 bg-black p-3 text-left transition-all hover:border-[#5E5E5E]/40 hover:bg-[#5E5E5E]/5 active:scale-[0.99] cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#48E5C2]/30 bg-[#48E5C2]/10 text-[#48E5C2]">
                                            <Shield size={17} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-[#FCFAF9] group-hover:text-[#48E5C2] transition-colors">
                                                Secret Recovery Phrase
                                            </p>
                                            <p className="text-[11px] text-[#5E5E5E]">
                                                Reveal your recovery phrase
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-[#5E5E5E] group-hover:text-[#FCFAF9] transition-colors" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Section D: Danger Zone */}
                    <DangerZoneSection
                        address={account.address}
                        walletName={currentName}
                        isOnlyAccount={isOnlyAccount}
                        onRemoveAccount={handleRemoveAccount}
                    />
                </main>
            </div>

            {/* Security PIN Authentication Modal */}
            <SecurityConfirmationModal
                isOpen={Boolean(activeAuthTarget)}
                title={
                    activeAuthTarget === 'privateKey'
                        ? 'Reveal Private Key'
                        : 'Reveal Recovery Phrase'
                }
                description={
                    activeAuthTarget === 'privateKey'
                        ? 'Enter your 6-digit wallet PIN to reveal your private key.'
                        : 'Enter your 6-digit wallet PIN to reveal your Secret Recovery Phrase.'
                }
                onConfirm={handleConfirmAuth}
                onClose={() => setActiveAuthTarget(null)}
            />
        </div>
    )
}

export default AccountDetails
