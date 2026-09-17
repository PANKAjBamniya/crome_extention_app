import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useWalletManager } from '../../hook/useWalletManager'
import PinInput from '../PinInput/PinInput'
import { Button } from '../../components/Button'

interface LocationState {
    message?: string
    targetAddress?: string
}

const Unlock = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { unlockWallet } = useWalletManager()

    const locationState = (location.state as LocationState) || {}
    const customMessage = locationState.message
    const targetAddress = locationState.targetAddress

    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleUnlock = async (pinToVerify?: string) => {
        const pin = pinToVerify ?? password
        if (pin.length !== 6 || isSubmitting) return

        setIsSubmitting(true)
        setError('')

        try {
            const result = await unlockWallet(pin, targetAddress)

            if (!result.success) {
                setError(result.error || 'Incorrect PIN. Please try again.')
                setPassword('')
                setIsSubmitting(false)
                return
            }

            navigate('/wallet', { replace: true })
        } catch (err) {
            console.error('Unlock error:', err)
            setError('Failed to unlock wallet. Please try again.')
            setPassword('')
            setIsSubmitting(false)
        }
    }

    const handlePinChange = (newPin: string) => {
        setPassword(newPin)
        if (error) setError('')

        // Automatically trigger unlock when 6th digit is typed
        if (newPin.length === 6) {
            handleUnlock(newPin)
        }
    }

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black text-[#FCFAF9]">
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
                    bg-[#48E5C2]
                    opacity-[0.035]
                    blur-[100px]
                "
            />

            <div className="relative mx-auto flex h-full w-full max-w-md flex-col">
                <main className="flex flex-1 flex-col overflow-hidden px-5">
                    {/* Header Icon & Title */}
                    <div className="mt-8 flex flex-col items-center text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#48E5C2]/30 bg-[#48E5C2]/10 text-[#48E5C2]">
                            <Lock size={26} strokeWidth={1.8} />
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight text-[#FCFAF9]">
                            Welcome Back
                        </h1>

                        <p className="mt-2 max-w-xs text-xs leading-5 text-[#5E5E5E]">
                            {customMessage || 'Enter your 6-digit PIN to access your wallet.'}
                        </p>
                    </div>

                    {/* PIN Pad */}
                    <div className="flex flex-1 items-center justify-center">
                        <div className="flex w-full flex-col items-center">
                            <PinInput
                                password={password}
                                onChange={handlePinChange}
                                error={error}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                </main>

                {/* Bottom Action */}
                <div className="shrink-0 border-t border-[#5E5E5E]/20 bg-black/95 px-5 pb-5 pt-3">
                    <Button
                        title={isSubmitting ? 'Unlocking...' : 'Unlock'}
                        variant="primary"
                        size="large"
                        width="full"
                        align="center"
                        disabled={password.length !== 6 || isSubmitting}
                        onClick={() => handleUnlock()}
                    />
                </div>
            </div>
        </div>
    )
}

export default Unlock

