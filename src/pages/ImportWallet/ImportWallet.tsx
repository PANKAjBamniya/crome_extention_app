import { useState } from 'react'
import { Eye, EyeOff, Clipboard, X } from 'lucide-react'
import { Button } from '../../components/Button'
import Back from '../../components/Back/Back'
import { SrpInput } from '../../components/SrpInput'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../store'
import { setImportedWallet } from '../../store/slices/walletSlice'
import {
    importWalletFromMnemonic,
    importWalletFromPrivateKey,
    validateRecoveryWords,
    validateRecoveryPhrase,
} from '../../wallet/creatWallet'
import { findWalletByAddress } from '../../services/walletStorage'

type ImportType = 'mnemonic' | 'privateKey'

const ImportWallet = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    const [importType, setImportType] = useState<ImportType>('mnemonic')
    const [showWords, setShowWords] = useState(false)
    const [showPrivateKey, setShowPrivateKey] = useState(false)
    const [error, setError] = useState('')
    const [invalidIndexes, setInvalidIndexes] = useState<number[]>([])

    // Mnemonic state
    const [words, setWords] = useState<string[]>(Array.from({ length: 12 }, () => ''))
    const hasWords = words.some((word) => word.trim() !== '')

    // Private key state
    const [privateKeyInput, setPrivateKeyInput] = useState('')

    const handleWordsChange = (updatedWords: string[]) => {
        setWords(updatedWords)
        if (invalidIndexes.length > 0) setInvalidIndexes([])
        if (error) setError('')
    }

    const handleClear = () => {
        if (importType === 'mnemonic') {
            setWords(Array.from({ length: 12 }, () => ''))
            setInvalidIndexes([])
        } else {
            setPrivateKeyInput('')
        }
        setError('')
    }

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText()
            if (!text.trim()) return

            if (importType === 'mnemonic') {
                const pastedWords = text
                    .trim()
                    .toLowerCase()
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 12)

                const updatedWords = Array.from(
                    { length: 12 },
                    (_, index) => pastedWords[index] ?? ''
                )
                setWords(updatedWords)
                setInvalidIndexes([])
            } else {
                setPrivateKeyInput(text.trim())
            }
            setError('')
        } catch (err) {
            console.error('Failed to read clipboard:', err)
        }
    }

    const handleContinue = async () => {
        setError('')

        // ─── PRIVATE KEY FLOW ───
        if (importType === 'privateKey') {
            let cleanKey = privateKeyInput.trim()
            if (!cleanKey) {
                setError('Please enter a private key.')
                return
            }

            if (cleanKey.startsWith('0x')) {
                cleanKey = cleanKey.slice(2)
            }

            if (cleanKey.length !== 64 || !/^[0-9a-fA-F]+$/.test(cleanKey)) {
                setError('Invalid private key format. Must be 64 hexadecimal characters.')
                return
            }

            const formattedKey = `0x${cleanKey}` as const

            try {
                const wallet = await importWalletFromPrivateKey(formattedKey)

                // Check if this wallet already exists in storage
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
                    setImportedWallet({
                        seedPhrase: '',
                        privateKey: wallet.privateKey,
                        address: wallet.address,
                    })
                )

                navigate('/create-password')
            } catch (err) {
                console.error('Private key import error:', err)
                setError('Failed to import private key. Please check the key and try again.')
            }
            return
        }

        // ─── MNEMONIC FLOW ───
        const cleanWords = words.map((word) => word.trim().toLowerCase())
        const { isValid: areWordsValid, invalidIndexes: badIndexes } = validateRecoveryWords(cleanWords)

        if (!areWordsValid || cleanWords.length !== 12) {
            setInvalidIndexes(badIndexes)
            setError('One or more recovery words are invalid.')
            return
        }

        const seedPhrase = cleanWords.join(' ')
        const isPhraseValid = validateRecoveryPhrase(seedPhrase)

        if (!isPhraseValid) {
            setInvalidIndexes([])
            setError('Invalid recovery phrase. Please check the order of your words.')
            return
        }

        try {
            const wallet = await importWalletFromMnemonic(seedPhrase)

            // Check if this wallet already exists in storage
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
                setImportedWallet({
                    seedPhrase,
                    privateKey: wallet.privateKey,
                    address: wallet.address,
                })
            )

            navigate('/create-password')
        } catch (err) {
            console.error('Wallet import failed:', err)
            setError('Failed to import wallet. Please try again.')
        }
    }

    const hasInput = importType === 'mnemonic' ? hasWords : privateKeyInput.trim().length > 0

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
                <main className="flex-1 overflow-y-auto px-5 pb-6 scrollbar-thin">
                    <div className="pt-4">
                        <Back />
                    </div>

                    <div className="mt-5 mb-5">
                        <h1 className="text-2xl font-semibold tracking-tight text-[#FCFAF9]">
                            Import Wallet
                        </h1>
                        <p className="mt-2 text-xs leading-5 text-[#5E5E5E]">
                            Enter your recovery phrase or private key to restore your wallet.
                        </p>
                    </div>

                    <div className="mb-4 flex rounded-xl border border-[#5E5E5E]/20 bg-black p-1">
                        <button
                            type="button"
                            onClick={() => {
                                setImportType('mnemonic')
                                setError('')
                            }}
                            className={`flex-1 rounded-lg py-3 text-xs font-medium transition-all ${importType === 'mnemonic'
                                ? 'bg-[#48E5C2] text-black font-semibold'
                                : 'text-[#5E5E5E] hover:text-[#FCFAF9]'
                                }`}
                        >
                            Recovery Phrase
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setImportType('privateKey')
                                setError('')
                            }}
                            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${importType === 'privateKey'
                                ? 'bg-[#48E5C2] text-black font-semibold'
                                : 'text-[#5E5E5E] hover:text-[#FCFAF9]'
                                }`}
                        >
                            Private Key
                        </button>
                    </div>

                    {importType === 'mnemonic' ? (
                        <>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="text-xs font-medium text-[#FCFAF9]">
                                    Seed Phrase
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowWords((prev) => !prev)}
                                    className="flex h-7 w-7 items-center justify-center rounded-md text-[#5E5E5E] transition-colors hover:bg-[#5E5E5E]/10 hover:text-[#FCFAF9]"
                                    aria-label={showWords ? 'Hide seed phrase' : 'Show seed phrase'}
                                >
                                    {showWords ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>

                            <div className="rounded-xl border border-[#5E5E5E]/20 bg-black p-3">
                                <p className="mb-3 text-[10px] text-[#5E5E5E]">
                                    Enter your 12-word recovery phrase
                                </p>
                                <SrpInput
                                    words={words}
                                    onChange={handleWordsChange}
                                    showWords={showWords}
                                    wordCount={12}
                                    invalidIndexes={invalidIndexes}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="text-xs font-medium text-[#FCFAF9]">
                                    Private Key
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPrivateKey((prev) => !prev)}
                                    className="flex h-7 w-7 items-center justify-center rounded-md text-[#5E5E5E] transition-colors hover:bg-[#5E5E5E]/10 hover:text-[#FCFAF9]"
                                    aria-label={showPrivateKey ? 'Hide private key' : 'Show private key'}
                                >
                                    {showPrivateKey ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>

                            <div className="rounded-xl border border-[#5E5E5E]/20 bg-black p-3">
                                <p className="mb-2 text-[10px] text-[#5E5E5E]">
                                    Paste your 64-character hexadecimal private key
                                </p>
                                <textarea
                                    rows={3}
                                    value={privateKeyInput}
                                    onChange={(e) => {
                                        setPrivateKeyInput(e.target.value)
                                        if (error) setError('')
                                    }}
                                    placeholder="e.g. 0x4f3edf983ac636a65a842ce7c78d5aa706d4e132..."
                                    className="w-full resize-none rounded-lg border border-[#5E5E5E]/30 bg-black p-2.5 font-mono text-xs text-[#FCFAF9] placeholder-[#5E5E5E] outline-none focus:border-[#48E5C2]"
                                    style={
                                        {
                                            WebkitTextSecurity: showPrivateKey ? 'none' : 'disc',
                                        } as React.CSSProperties
                                    }
                                />
                            </div>
                        </>
                    )}

                    {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div />
                        {hasInput ? (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#5E5E5E]/30 bg-black text-[11px] font-medium text-[#FCFAF9] transition-all duration-200 hover:border-red-400 hover:text-red-400 active:scale-[0.98]"
                            >
                                <X size={15} />
                                Clear
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handlePaste}
                                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#5E5E5E]/30 bg-black text-[11px] font-medium text-[#FCFAF9] transition-all duration-200 hover:border-[#48E5C2] hover:text-[#48E5C2] active:scale-[0.98]"
                            >
                                <Clipboard size={14} strokeWidth={1.5} />
                                Paste
                            </button>
                        )}
                    </div>
                </main>

                {/* Bottom Action */}
                <div className="shrink-0 border-t border-[#5E5E5E]/20 bg-black/95 px-5 pb-5 pt-3">
                    <Button
                        title="Continue"
                        variant="primary"
                        size="large"
                        width="full"
                        align="center"
                        disabled={!hasInput}
                        onClick={handleContinue}
                    />
                </div>
            </div>
        </div>
    )
}

export default ImportWallet
