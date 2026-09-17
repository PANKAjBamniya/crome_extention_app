import React, { useState } from 'react'
import { Trash2, AlertOctagon, X, AlertTriangle } from 'lucide-react'

interface DangerZoneSectionProps {
    address: string
    walletName: string
    isOnlyAccount: boolean
    onRemoveAccount: () => Promise<boolean>
}

export const DangerZoneSection: React.FC<DangerZoneSectionProps> = ({
    address,
    walletName,
    isOnlyAccount,
    onRemoveAccount,
}) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState('')

    const handleConfirmDelete = async () => {
        setIsDeleting(true)
        setError('')
        try {
            const success = await onRemoveAccount()
            if (!success) {
                setError('Failed to remove account. Please try again.')
                setIsDeleting(false)
            }
        } catch {
            setError('Failed to remove account. Please try again.')
            setIsDeleting(false)
        }
    }

    return (
        <div className="rounded-2xl border border-red-500/20 bg-black p-4">
            <div className="flex items-center gap-2 pb-3 border-b border-red-500/10">
                <AlertOctagon size={15} className="text-red-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
                    Danger Zone
                </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-medium text-[#FCFAF9]">
                        Remove Account
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#5E5E5E]">
                        {isOnlyAccount
                            ? 'Cannot remove your only active account.'
                            : 'Remove this account from this browser extension.'}
                    </p>
                </div>

                <button
                    type="button"
                    disabled={isOnlyAccount || isDeleting}
                    onClick={() => setShowConfirmModal(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Trash2 size={13} />
                    <span>Remove</span>
                </button>
            </div>

            {/* Remove Account Confirmation Modal */}
            {showConfirmModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    onClick={() => !isDeleting && setShowConfirmModal(false)}
                >
                    <div
                        className="relative flex w-full max-w-sm flex-col rounded-2xl border border-red-500/30 bg-black p-5 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-[#5E5E5E]/20">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
                                    <Trash2 size={17} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-[#FCFAF9]">
                                        Remove Account
                                    </h3>
                                    <p className="text-[11px] text-red-400">
                                        Irreversible Action
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setShowConfirmModal(false)}
                                className="rounded-lg p-1.5 text-[#5E5E5E] hover:bg-[#5E5E5E]/10 hover:text-[#FCFAF9] transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="mt-4 space-y-3 text-xs leading-5 text-[#5E5E5E]">
                            <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-amber-300">
                                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                                <p className="text-[11px]">
                                    Make sure you have backed up your private key or Secret Recovery Phrase before removing <strong>{walletName}</strong>.
                                </p>
                            </div>
                            <p>
                                Removing this account will erase its stored credentials from this extension. If you do not have a backup, you will permanently lose access to all funds.
                            </p>
                        </div>

                        {error && (
                            <p className="mt-3 text-xs text-red-400">
                                {error}
                            </p>
                        )}

                        <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#5E5E5E]/20 pt-3">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setShowConfirmModal(false)}
                                className="rounded-xl px-4 py-2 text-xs font-medium text-[#5E5E5E] hover:text-[#FCFAF9] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={handleConfirmDelete}
                                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? 'Removing...' : 'Confirm Removal'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DangerZoneSection

