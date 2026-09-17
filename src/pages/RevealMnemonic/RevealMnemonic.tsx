import { useCallback, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import {
    Check,
    Copy,
    Eye,
    EyeOff,
    AlertCircle,
} from 'lucide-react'
import { Button } from '../../components/Button'
import Back from '../../components/Back/Back'

const RevealMnemonic = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const [showAllSeedPhrase, setShowAllSeedPhrase] = useState(false)
    const [copied, setCopied] = useState(false)

    const reduxSeedPhrase = useSelector(
        (state: RootState) => state.wallet.seedPhrase
    )

    const mnemonic =
        reduxSeedPhrase ||
        (location.state as { mnemonic?: string } | null)?.mnemonic ||
        ''

    const words = mnemonic
        ? mnemonic.trim().split(/\s+/)
        : []

    const toggleShowAllSeedPhrase = () => {
        setShowAllSeedPhrase(prev => !prev)
    }

    const onContinue = () => {
        navigate('/wallet-ready')
    }

    const onCopy = useCallback(async () => {
        if (!mnemonic) return

        try {
            await navigator.clipboard.writeText(mnemonic)

            setCopied(true)

            setTimeout(() => {
                setCopied(false)
            }, 2000)
        } catch (error) {
            console.error('Failed to copy recovery phrase')
        }
    }, [mnemonic])

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

                {/* Header */}
                <div className="shrink-0 px-5 pt-4">
                    <Back />
                </div>

                {/* Main */}
                <main className="flex flex-1 flex-col overflow-y-auto px-5 pb-6">

                    {/* Title */}
                    <div className="mb-5">
                        <h1 className="text-2xl font-semibold tracking-tight text-[#FCFAF9]">
                            Your Secret Recovery Phrase
                        </h1>

                        <p className="mt-2 text-xs leading-5 text-[#5E5E5E]">
                            Write down or copy these {words.length || 12} words
                            in order.
                        </p>
                    </div>

                    {/* Warning */}
                    <div
                        className="
                            mb-5
                            flex
                            items-start
                            gap-3
                            rounded-xl
                            border
                            border-[#5E5E5E]/20
                            bg-black
                            p-3
                        "
                    >
                        <AlertCircle
                            size={18}
                            className="mt-0.5 shrink-0 text-[#48E5C2]"
                            strokeWidth={1.6}
                        />

                        <p className="text-[10px] leading-4 text-[#5E5E5E]">
                            Never share your recovery phrase. Anyone with it
                            can access your wallet.
                        </p>
                    </div>

                    {/* Seed Phrase */}
                    <div className="relative">

                        {/* Eye */}
                        <button
                            type="button"
                            onClick={toggleShowAllSeedPhrase}
                            disabled={!mnemonic}
                            className="
                                absolute
                                right-1
                                top-0
                                z-10
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                text-[#5E5E5E]
                                transition-colors
                                hover:bg-[#5E5E5E]/10
                                hover:text-[#FCFAF9]
                                disabled:cursor-not-allowed
                                disabled:opacity-30
                            "
                            aria-label={
                                showAllSeedPhrase
                                    ? 'Hide recovery phrase'
                                    : 'Show recovery phrase'
                            }
                        >
                            {showAllSeedPhrase ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>

                        <div
                            className="
                                pt-8
                                rounded-xl
                                border
                                border-[#5E5E5E]/20
                                bg-black
                                p-3
                            "
                        >
                            <div className="grid grid-cols-3 gap-2">

                                {words.map((word, index) => (
                                    <div
                                        key={index}
                                        className="
                                            flex
                                            min-h-[48px]
                                            flex-col
                                            items-center
                                            justify-center
                                            rounded-lg
                                            border
                                            border-[#5E5E5E]/20
                                            bg-black
                                            px-2
                                        "
                                    >
                                        <span className="text-[11px] font-medium text-[#FCFAF9]">
                                            {showAllSeedPhrase
                                                ? word
                                                : '*'.repeat(word.length)}
                                        </span>
                                    </div>
                                ))}

                            </div>
                        </div>

                        {/* Copy */}
                        <div className="mt-3 flex justify-end">
                            <button
                                type="button"
                                onClick={onCopy}
                                disabled={!mnemonic}
                                className="
                                    flex
                                    h-10
                                    items-center
                                    gap-2
                                    rounded-lg
                                    border
                                    border-[#5E5E5E]/30
                                    bg-black
                                    px-4
                                    text-[11px]
                                    font-medium
                                    text-[#5E5E5E]
                                    transition-all
                                    hover:border-[#48E5C2]
                                    hover:text-[#FCFAF9]
                                    active:scale-[0.98]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                {copied ? (
                                    <>
                                        <Check
                                            size={15}
                                            className="text-[#48E5C2]"
                                        />
                                        <span className="text-[#48E5C2]">
                                            Copied
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={15} />
                                        <span>Copy</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Security Warning */}
                    <div
                        className="
                            mt-5
                            rounded-xl
                            border
                            border-red-500/20
                            bg-red-500/[0.03]
                            p-4
                        "
                    >
                        <p className="text-[10px] font-medium text-red-400">
                            Keep your recovery phrase private
                        </p>

                        <p className="mt-1 text-[9px] leading-4 text-[#5E5E5E]">
                            Anyone with these words can access your wallet.
                            Never share them with anyone.
                        </p>
                    </div>

                </main>

                {/* Bottom Continue */}
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
                        onClick={onContinue}
                    />
                </div>

            </div>
        </div>
    )
}

export default RevealMnemonic