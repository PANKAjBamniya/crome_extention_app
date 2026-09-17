import React, { useState } from 'react'
import { Lock, X, AlertCircle } from 'lucide-react'
import PinInput from '../../pages/PinInput/PinInput'

interface SecurityConfirmationModalProps {
    isOpen: boolean
    title?: string
    description?: string
    onConfirm: (pin: string) => Promise<boolean>
    onClose: () => void
}

export const SecurityConfirmationModal: React.FC<SecurityConfirmationModalProps> = ({
    isOpen,
    title = 'Confirm Security PIN',
    description = 'Enter your 6-digit PIN to access sensitive wallet credentials.',
    onConfirm,
    onClose,
}) => {
    const [pin, setPin] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!isOpen) return null

    const handleClose = () => {
        setPin('')
        setError('')
        setIsSubmitting(false)
        onClose()
    }

    const handleSubmit = async (pinToVerify?: string) => {
        const pinValue = pinToVerify ?? pin
        if (pinValue.length !== 6 || isSubmitting) return

        setIsSubmitting(true)
        setError('')

        try {
            const success = await onConfirm(pinValue)
            if (!success) {
                setError('Incorrect PIN. Please try again.')
                setPin('')
                setIsSubmitting(false)
            } else {
                setPin('')
                setError('')
                setIsSubmitting(false)
            }
        } catch {
            setError('Authentication failed. Please try again.')
            setPin('')
            setIsSubmitting(false)
        }
    }

    const handlePinChange = (newPin: string) => {
        setPin(newPin)
        if (error) setError('')

        if (newPin.length === 6) {
            handleSubmit(newPin)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={handleClose}
        >
            <div
                className="relative flex w-full max-w-sm max-h-[95vh] flex-col overflow-y-auto rounded-2xl border border-[#5E5E5E]/20 bg-black p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#5E5E5E]/20">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#48E5C2]/30 bg-[#48E5C2]/10 text-[#48E5C2]">
                            <Lock size={17} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-[#FCFAF9]">
                                {title}
                            </h3>
                            <p className="text-[11px] text-[#5E5E5E]">
                                Security Check
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg p-1.5 text-[#5E5E5E] hover:bg-[#5E5E5E]/10 hover:text-[#FCFAF9] transition-colors"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs leading-5 text-[#5E5E5E]">
                    {description}
                </p>

                {/* Error Banner */}
                {error && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* PIN Pad */}
                <div className="my-4 flex justify-center">
                    <PinInput
                        password={pin}
                        onChange={handlePinChange}
                        error=""
                        disabled={isSubmitting}
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#5E5E5E]/20">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="rounded-xl px-4 py-2 text-xs font-medium text-[#5E5E5E] hover:text-[#FCFAF9] transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSubmit()}
                        disabled={pin.length !== 6 || isSubmitting}
                        className="rounded-xl bg-[#48E5C2] px-5 py-2 text-xs font-semibold text-black hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isSubmitting ? 'Verifying...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SecurityConfirmationModal

