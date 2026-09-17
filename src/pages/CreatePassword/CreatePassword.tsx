import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import Back from '../../components/Back/Back'
import PinInput from '../PinInput/PinInput'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../../store'
import {
    setCreatedPassword,
    clearSensitiveWalletData,
    setWalletAddress,
    setAccounts,
    setUnlocked,
} from '../../store/slices/walletSlice'
import { useWalletManager } from '../../hook/useWalletManager'

const CreatePassword = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch<AppDispatch>()
    const { hasPassword, verifyPassword, saveNewWallet, getStoredAccounts } = useWalletManager()

    const isConfirmPassword = location.pathname === '/confirm-password'

    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasExistingMasterPassword, setHasExistingMasterPassword] = useState<boolean | null>(null)

    const seedPhrase = useSelector((state: RootState) => state.wallet.seedPhrase)
    const privateKey = useSelector((state: RootState) => state.wallet.privateKey)
    const createdPassword = useSelector((state: RootState) => state.wallet.createdPassword)
    const isImportFlow = useSelector((state: RootState) => state.wallet.isImported)
    const walletAddress = useSelector((state: RootState) => state.wallet.address)
    const walletName = useSelector((state: RootState) => state.wallet.walletName)

    useEffect(() => {
        let isMounted = true
        hasPassword().then((has: boolean) => {
            if (isMounted) {
                setHasExistingMasterPassword(has)
            }
        })
        return () => {
            isMounted = false
        }
    }, [hasPassword])

    const handleContinue = async (pinToUse?: string) => {
        const pin = pinToUse ?? password
        if (pin.length !== 6 || isSubmitting) return

        setError('')
        setIsSubmitting(true)

        try {
            // Case 1: An existing master password is already registered in storage
            if (hasExistingMasterPassword) {
                const isValid = await verifyPassword(pin)
                if (!isValid) {
                    setError('Incorrect PIN. Please enter your existing wallet PIN.')
                    setPassword('')
                    setIsSubmitting(false)
                    return
                }

                const secret = seedPhrase || privateKey || ''
                const walletType = seedPhrase ? 'mnemonic' : 'privateKey'

                const newWallet = await saveNewWallet({
                    secret,
                    address: walletAddress || '',
                    password: pin,
                    walletType,
                    walletName,
                })

                const accounts = await getStoredAccounts()
                dispatch(setAccounts(accounts))
                dispatch(
                    setWalletAddress({
                        address: newWallet.address,
                        walletName: newWallet.walletName || newWallet.name,
                    })
                )
                dispatch(setUnlocked(true))

                if (isImportFlow) {
                    dispatch(clearSensitiveWalletData())
                    navigate('/wallet', { replace: true })
                } else {
                    navigate('/reveal-mnemonic')
                }
                return
            }

            // Case 2: Setting up password for the first time
            // Step 2a: Create Password
            if (!isConfirmPassword) {
                dispatch(setCreatedPassword(pin))
                setPassword('')
                setIsSubmitting(false)
                navigate('/confirm-password')
                return
            }

            // Step 2b: Confirm Password
            if (!createdPassword) {
                setError('Password session expired. Please start over.')
                setIsSubmitting(false)
                navigate('/create-password')
                return
            }

            if (pin !== createdPassword) {
                setError('PIN does not match. Please try again.')
                setPassword('')
                setIsSubmitting(false)
                return
            }

            const secret = seedPhrase || privateKey || ''
            const walletType = seedPhrase ? 'mnemonic' : 'privateKey'

            const newWallet = await saveNewWallet({
                secret,
                address: walletAddress || '',
                password: pin,
                walletType,
                walletName,
            })

            const accounts = await getStoredAccounts()
            dispatch(setAccounts(accounts))
            dispatch(
                setWalletAddress({
                    address: newWallet.address,
                    walletName: newWallet.walletName || newWallet.name,
                })
            )
            dispatch(setUnlocked(true))

            if (isImportFlow) {
                dispatch(clearSensitiveWalletData())
                navigate('/wallet', { replace: true })
            } else {
                navigate('/reveal-mnemonic')
            }
        } catch (err) {
            console.error('Save wallet error:', err)
            setError(err instanceof Error ? err.message : 'Failed to secure wallet')
            setIsSubmitting(false)
        }
    }

    const handlePinChange = (newPin: string) => {
        setPassword(newPin)
        if (error) setError('')

        if (newPin.length === 6) {
            handleContinue(newPin)
        }
    }

    const getTitle = () => {
        if (hasExistingMasterPassword) return 'Enter Wallet PIN'
        if (isConfirmPassword) return 'Confirm Password'
        return 'Create Password'
    }

    const getSubtitle = () => {
        if (hasExistingMasterPassword) {
            return 'Enter your existing 6-digit PIN to secure and add this wallet.'
        }
        if (isConfirmPassword) {
            return 'Enter your 6-digit PIN again to confirm.'
        }
        return 'Create a 6-digit PIN to securely protect your wallet.'
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
                <div className="shrink-0 px-5 pt-4">
                    <Back />
                </div>

                {/* Main */}
                <main className="flex flex-1 flex-col overflow-hidden px-5">
                    {/* Title */}
                    <div className="mt-5 shrink-0">
                        <h1 className="text-2xl font-semibold tracking-tight text-[#FCFAF9]">
                            {getTitle()}
                        </h1>

                        <p className="mt-2 text-xs leading-5 text-[#5E5E5E]">
                            {getSubtitle()}
                        </p>
                    </div>

                    {/* PIN */}
                    <div className="flex flex-1 items-center justify-center">
                        <div className="flex w-full flex-col items-center">
                            <div className="mb-4">
                                <p className="text-xs font-medium text-[#5E5E5E]">
                                    {hasExistingMasterPassword
                                        ? 'Enter your 6-digit PIN'
                                        : isConfirmPassword
                                            ? 'Confirm your 6-digit PIN'
                                            : 'Enter your 6-digit PIN'}
                                </p>
                            </div>

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
                        title={
                            isSubmitting
                                ? 'Securing...'
                                : hasExistingMasterPassword
                                    ? 'Confirm PIN'
                                    : isConfirmPassword
                                        ? 'Confirm Password'
                                        : 'Create Password'
                        }
                        variant="primary"
                        size="large"
                        width="full"
                        align="center"
                        disabled={password.length !== 6 || isSubmitting}
                        onClick={() => handleContinue()}
                    />
                </div>
            </div>
        </div>
    )
}

export default CreatePassword
