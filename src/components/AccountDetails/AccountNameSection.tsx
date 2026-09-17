import React, { useState, useEffect } from 'react'
import { Check, Edit2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../../store'
import { setWalletAddress, setAccounts } from '../../store/slices/walletSlice'
import { updateWallet, getWallets } from '../../services/walletStorage'
import { setActiveAccount } from '../../services/walletVault'

interface AccountNameSectionProps {
    address: string
    currentName: string
    onNameUpdated?: (newName: string) => void
}

export const AccountNameSection: React.FC<AccountNameSectionProps> = ({
    address,
    currentName,
    onNameUpdated,
}) => {
    const dispatch = useDispatch<AppDispatch>()
    const activeAddress = useSelector((state: RootState) => state.wallet.address)
    const accounts = useSelector((state: RootState) => state.wallet.accounts)

    const [name, setName] = useState(currentName)
    const [isSaving, setIsSaving] = useState(false)
    const [savedSuccess, setSavedSuccess] = useState(false)

    useEffect(() => {
        setName(currentName)
    }, [currentName])

    const trimmed = name.trim()
    const isUnchanged = trimmed === currentName.trim()
    const canSave = trimmed.length > 0 && !isUnchanged && !isSaving

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!canSave) return

        setIsSaving(true)
        const finalName = trimmed

        try {
            // 1. Update stored wallet object
            const allWallets = await getWallets()
            const target = allWallets.find(
                (w) => w.address.toLowerCase() === address.toLowerCase()
            )

            if (target) {
                await updateWallet({
                    ...target,
                    name: finalName,
                    walletName: finalName,
                })
            }

            // 2. Update Redux accounts list
            const updatedAccounts = accounts.map((acc) =>
                acc.address.toLowerCase() === address.toLowerCase()
                    ? { ...acc, walletName: finalName }
                    : acc
            )
            dispatch(setAccounts(updatedAccounts))

            // 3. If this is active account, update active account state
            if (
                activeAddress &&
                activeAddress.toLowerCase() === address.toLowerCase()
            ) {
                await setActiveAccount(address, finalName)
                dispatch(
                    setWalletAddress({
                        address,
                        walletName: finalName,
                    })
                )
            }

            // 4. Trigger parent callback
            onNameUpdated?.(finalName)

            setSavedSuccess(true)
            setTimeout(() => setSavedSuccess(false), 2500)
        } catch (err) {
            console.error('Failed to update account name:', err)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="rounded-2xl border border-[#5E5E5E]/20 bg-black p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Edit2 size={15} className="text-[#48E5C2]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#5E5E5E]">
                        Account Name
                    </span>
                </div>
                {savedSuccess && (
                    <span className="flex items-center gap-1 text-xs text-[#48E5C2]">
                        <Check size={13} />
                        Saved
                    </span>
                )}
            </div>

            <form onSubmit={handleSave} className="mt-3 flex items-center gap-2">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Account Name"
                    maxLength={32}
                    className="flex-1 rounded-xl border border-[#5E5E5E]/30 bg-black px-3.5 py-2 text-sm text-[#FCFAF9] placeholder-[#5E5E5E] outline-none transition-colors focus:border-[#48E5C2]"
                />
                <button
                    type="submit"
                    disabled={!canSave}
                    className="rounded-xl bg-[#48E5C2] px-4 py-2 text-xs font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
            </form>
        </div>
    )
}

export default AccountNameSection

