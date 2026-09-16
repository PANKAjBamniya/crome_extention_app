import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../store'
import { clearSensitiveWalletData, setUnlocked } from '../../store/slices/walletSlice'
import Button from '../../components/Button/Button'
import Back from '../../components/Back/Back'

const WalletReady = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    const handleGetStarted = () => {
        dispatch(clearSensitiveWalletData())
        dispatch(setUnlocked(true))
        navigate('/wallet', { replace: true })
    }

    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden bg-black text-white">

            <div className="mx-auto flex h-full w-full max-w-md flex-col">

                {/* Back */}
                <div className="shrink-0 px-6 pt-8">
                    <Back />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col items-center justify-center px-6">

                    {/* Success Icon */}
                    <div className="mb-7 flex h-24 w-24 items-center justify-center rounded-full border border-[#C7F11D]/30 bg-[#C7F11D]/10">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C7F11D]">
                            <CheckCircle2
                                size={38}
                                className="text-black"
                                strokeWidth={2.5}
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-center text-2xl font-bold">
                        Your wallet is ready!
                    </h1>

                    {/* Description */}
                    <p className="mt-3 max-w-sm text-center text-sm leading-6 text-gray-400">
                        Your wallet has been successfully created and secured.
                        You can now start managing your crypto assets.
                    </p>

                    {/* Security Card */}
                    <div className="mt-8 w-full rounded-2xl border border-white/10 bg-[#111111] p-4">

                        <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C7F11D]/10">
                                <ShieldCheck
                                    size={21}
                                    className="text-[#C7F11D]"
                                />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-white">
                                    Keep your recovery phrase safe
                                </p>

                                <p className="mt-1 text-xs leading-5 text-gray-400">
                                    Never share your recovery phrase with anyone.
                                    It is the only way to recover your wallet.
                                </p>
                            </div>

                        </div>

                    </div>

                    {/* Features */}
                    <div className="mt-6 grid w-full grid-cols-3 gap-3">

                        <div className="rounded-xl border border-white/10 bg-[#0D0D0D] p-3 text-center">
                            <p className="text-xs font-medium text-gray-300">
                                Secure
                            </p>

                            <p className="mt-1 text-[10px] text-gray-500">
                                Protected wallet
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-[#0D0D0D] p-3 text-center">
                            <p className="text-xs font-medium text-gray-300">
                                Private
                            </p>

                            <p className="mt-1 text-[10px] text-gray-500">
                                You control it
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-[#0D0D0D] p-3 text-center">
                            <p className="text-xs font-medium text-gray-300">
                                Ready
                            </p>

                            <p className="mt-1 text-[10px] text-gray-500">
                                Start using it
                            </p>
                        </div>

                    </div>

                </div>

                {/* Bottom Button */}
                <div className="shrink-0 px-6 pb-7">
                    <Button
                        title="Get Started"
                        onClick={handleGetStarted}
                        icon={<ArrowRight size={18} />}
                        iconPosition="right"
                        bold
                    />
                </div>

            </div>

        </div>
    )
}

export default WalletReady