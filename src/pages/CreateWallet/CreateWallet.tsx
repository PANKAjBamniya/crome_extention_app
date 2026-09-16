import { useNavigate } from 'react-router-dom'
import { ShieldCheck, KeyRound, Globe, Link } from 'lucide-react'
import { Button } from '../../components/Button'
import Back from '../../components/Back/Back'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../store'
import { setCreatedWallet } from '../../store/slices/walletSlice'
import { createWallet } from '../../wallet/creatWallet'
import { findWalletByAddress } from '../../services/walletStorage'

const CreateWallet = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    const handleCreateWallet = async () => {
        try {
            const wallet = await createWallet()

            // Check if address already exists in stored wallets
            const existing = await findWalletByAddress(wallet.address)
            if (existing) {
                navigate('/unlock', {
                    state: {
                        message: 'This wallet is already in your accounts. Enter your PIN to open it.',
                        targetAddress: existing.address,
                    },
                })
                return
            }

            dispatch(
                setCreatedWallet({
                    seedPhrase: wallet.mnemonic,
                    privateKey: wallet.privateKey,
                    address: wallet.address,
                })
            )

            navigate('/create-password')
        } catch (error) {
            console.error('Create wallet failed:', error)
        }
    }

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black text-white">

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

            <div
                className="
                    relative
                    mx-auto
                    flex
                    h-full
                    w-full
                    max-w-md
                    flex-col
                "
            >

                <main className="flex-1 overflow-y-auto px-5 pb-6">

                    <div className="pt-4">
                        <Back />
                    </div>

                    <div className="mt-5 mb-7">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Create New Wallet
                        </h1>

                        <p className="mt-2 text-xs leading-5 text-gray-500">
                            Create a new wallet and securely manage your crypto assets.
                        </p>
                    </div>

                    <div
                        className="
                            rounded-xl
                            border
                            border-[#536500]
                            bg-[#050900]
                            p-4
                        "
                    >
                        <p className="mb-4 text-[10px] font-medium text-gray-500">
                            YOUR WALLET WILL INCLUDE
                        </p>

                        <div className="space-y-4">

                            <div className="flex items-center gap-3">
                                <div
                                    className="
                                        flex
                                        h-9
                                        w-9
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-lg
                                        bg-[#C7F11D0A]
                                        text-[#C7F11D]
                                    "
                                >
                                    <KeyRound size={16} strokeWidth={1.5} />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-white">
                                        Secret Recovery Phrase
                                    </p>

                                    <p className="mt-0.5 text-[10px] text-gray-500">
                                        A new recovery phrase for your wallet
                                    </p>
                                </div>
                            </div>

                            {/* Encryption */}
                            <div className="flex items-center gap-3">
                                <div
                                    className="
                                        flex
                                        h-9
                                        w-9
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-lg
                                        bg-[#C7F11D0A]
                                        text-[#C7F11D]
                                    "
                                >
                                    <ShieldCheck size={16} strokeWidth={1.5} />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-white">
                                        Secure Encryption
                                    </p>

                                    <p className="mt-0.5 text-[10px] text-gray-500">
                                        Your wallet data is encrypted locally
                                    </p>
                                </div>
                            </div>

                            {/* Networks */}
                            <div className="flex items-center gap-3">
                                <div
                                    className="
                                        flex
                                        h-9
                                        w-9
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-lg
                                        bg-[#C7F11D0A]
                                        text-[#C7F11D]
                                    "
                                >
                                    <Globe size={16} strokeWidth={1.5} />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-white">
                                        Blockchain Networks
                                    </p>

                                    <p className="mt-0.5 text-[10px] text-gray-500">
                                        Access supported blockchain networks
                                    </p>
                                </div>
                            </div>

                            {/* dApps */}
                            <div className="flex items-center gap-3">
                                <div
                                    className="
                                        flex
                                        h-9
                                        w-9
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-lg
                                        bg-[#C7F11D0A]
                                        text-[#C7F11D]
                                    "
                                >
                                    <Link size={16} strokeWidth={1.5} />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-white">
                                        dApp Connections
                                    </p>

                                    <p className="mt-0.5 text-[10px] text-gray-500">
                                        Connect your wallet with Web3 apps
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Security Notice */}
                    <div
                        className="
                            mt-4
                            rounded-xl
                            border
                            border-white/5
                            bg-white/[0.02]
                            p-4
                        "
                    >
                        <p className="text-[10px] leading-4 text-gray-500">
                            Your recovery phrase is the only way to restore your
                            wallet. Keep it private and store it in a safe place.
                        </p>
                    </div>

                </main>

                {/* Bottom Action */}
                <div
                    className="
                        shrink-0
                        border-t
                        border-white/5
                        bg-black/95
                        px-5
                        pb-5
                        pt-3
                    "
                >
                    <Button
                        title="Continue"
                        variant="primary"
                        size="large"
                        width="full"
                        align="center"
                        onClick={handleCreateWallet}
                    />

                    <p className="mt-3 text-center text-[9px] leading-4 text-gray-500">
                        Never share your recovery phrase with anyone.
                    </p>
                </div>

            </div>
        </div>
    )
}

export default CreateWallet
