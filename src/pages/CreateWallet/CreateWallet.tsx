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
        <div className="relative h-screen w-full overflow-hidden bg-black text-[#FCFAF9]">

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
                        <h1 className="text-2xl font-semibold tracking-tight text-[#FCFAF9]">
                            Create New Wallet
                        </h1>

                        <p className="mt-2 text-xs leading-5 text-[#5E5E5E]">
                            Create a new wallet and securely manage your crypto assets.
                        </p>
                    </div>

                    <div
                        className="
                            rounded-xl
                            border
                            border-[#5E5E5E]/20
                            bg-black
                            p-4
                        "
                    >
                        <p className="mb-4 text-[10px] font-medium text-[#5E5E5E]">
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
                                        border
                                        border-[#48E5C2]/30
                                        bg-[#48E5C2]/10
                                        text-[#48E5C2]
                                    "
                                >
                                    <KeyRound size={16} strokeWidth={1.5} />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-[#FCFAF9]">
                                        Secret Recovery Phrase
                                    </p>

                                    <p className="mt-0.5 text-[10px] text-[#5E5E5E]">
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
                                        border
                                        border-[#48E5C2]/30
                                        bg-[#48E5C2]/10
                                        text-[#48E5C2]
                                    "
                                >
                                    <ShieldCheck size={16} strokeWidth={1.5} />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-[#FCFAF9]">
                                        Secure Encryption
                                    </p>

                                    <p className="mt-0.5 text-[10px] text-[#5E5E5E]">
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
                                        border
                                        border-[#48E5C2]/30
                                        bg-[#48E5C2]/10
                                        text-[#48E5C2]
                                    "
                                >
                                    <Globe size={16} strokeWidth={1.5} />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-[#FCFAF9]">
                                        Blockchain Networks
                                    </p>

                                    <p className="mt-0.5 text-[10px] text-[#5E5E5E]">
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
                                        border
                                        border-[#48E5C2]/30
                                        bg-[#48E5C2]/10
                                        text-[#48E5C2]
                                    "
                                >
                                    <Link size={16} strokeWidth={1.5} />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-[#FCFAF9]">
                                        dApp Connections
                                    </p>

                                    <p className="mt-0.5 text-[10px] text-[#5E5E5E]">
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
                            border-[#5E5E5E]/20
                            bg-black
                            p-4
                        "
                    >
                        <p className="text-[10px] leading-4 text-[#5E5E5E]">
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
                        border-[#5E5E5E]/20
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

                    <p className="mt-3 text-center text-[9px] leading-4 text-[#5E5E5E]">
                        Never share your recovery phrase with anyone.
                    </p>
                </div>

            </div>
        </div>
    )
}

export default CreateWallet
