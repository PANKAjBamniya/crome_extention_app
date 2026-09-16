import React, { useState } from 'react'
import { Clipboard, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../store'
import type { EVMNetwork } from '../../config/networks'
import type { Token } from '../../types/token'
import { validateTokenAddress } from '../../utils/token/validateTokenAddress'
import { normalizeAddress, createTokenId } from '../../utils/token/normalizeToken'
import { getTokenMetadata } from '../../services/token/erc20'
import { hasToken, saveToken } from '../../services/token/tokenStorage'
import { isBuiltInToken } from '../../services/token/tokenRegistry'
import { resolveTokenLogo } from '../../services/token/tokenLogoService'
import { addCustomToken } from '../../store/slices/tokenSlice'
import { Button } from '../Button'
import ImageComp from '../ImageComp/ImageComp'
import SelectNetworkSheet from '../sheets/SelectNetworkSheet/SelectNetworkSheet'

interface TokenImportFormProps {
    activeNetwork: EVMNetwork
    networks: EVMNetwork[]
    onSelectNetwork: (network: EVMNetwork) => void
    onImportSuccess: (token: Token) => void
    onCancel?: () => void
}

interface PreviewData {
    name: string
    symbol: string
    decimals: number
    address: string
    logoUrl?: string
}

export const TokenImportForm: React.FC<TokenImportFormProps> = ({
    activeNetwork,
    networks,
    onSelectNetwork,
    onImportSuccess,
    onCancel,
}) => {
    const dispatch = useDispatch<AppDispatch>()

    const [contractAddress, setContractAddress] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [preview, setPreview] = useState<PreviewData | null>(null)
    const [isNetworkSheetOpen, setIsNetworkSheetOpen] = useState(false)

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText()
            if (text) {
                setContractAddress(text.trim())
                setError(null)
                setPreview(null)
            }
        } catch (err) {
            console.error('Failed to read clipboard:', err)
        }
    }

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContractAddress(e.target.value)
        setError(null)
        setPreview(null)
    }

    const handleContinue = async () => {
        const trimmed = contractAddress.trim()
        if (!trimmed) {
            setError('Please enter a contract address')
            return
        }

        // 1. Validate EVM address
        if (!validateTokenAddress(trimmed)) {
            setError('Invalid token contract address')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const normalized = normalizeAddress(trimmed)

            // 2. Duplicate prevention
            const alreadyExists =
                (await hasToken(activeNetwork.chainId, normalized)) ||
                isBuiltInToken(activeNetwork.chainId, normalized)

            if (alreadyExists) {
                setError('Token already added')
                setIsLoading(false)
                return
            }

            // 3. Read metadata from contract and resolve token logo
            const [metadata, logoUrl] = await Promise.all([
                getTokenMetadata(activeNetwork, normalized),
                resolveTokenLogo({
                    chainId: activeNetwork.chainId,
                    address: normalized,
                }),
            ])

            setPreview({
                name: metadata.name,
                symbol: metadata.symbol,
                decimals: metadata.decimals,
                address: normalized,
                logoUrl,
            })
        } catch (err: any) {
            setError(
                err?.message ||
                'Unable to read token information from this contract'
            )
        } finally {
            setIsLoading(false)
        }
    }

    const handleConfirmImport = async () => {
        if (!preview) return

        setIsLoading(true)
        setError(null)

        try {
            const newToken: Token = {
                id: createTokenId(activeNetwork.chainId, preview.address),
                chainId: activeNetwork.chainId,
                address: preview.address,
                name: preview.name,
                symbol: preview.symbol,
                decimals: preview.decimals,
                logoUrl: preview.logoUrl,
                isCustom: true,
                createdAt: Date.now(),
            }

            await saveToken(newToken)
            dispatch(addCustomToken(newToken))
            onImportSuccess(newToken)
        } catch (err: any) {
            setError('Failed to save token. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Network Selector */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400">
                    Network
                </label>
                <button
                    type="button"
                    onClick={() => setIsNetworkSheetOpen(true)}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-[#121315] px-3.5 py-2.5 text-xs text-white hover:border-white/20 transition-colors"
                >
                    <div className="flex items-center gap-2.5">
                        <ImageComp
                            src={activeNetwork.icon}
                            alt={activeNetwork.name}
                            size={20}
                            className="rounded-full object-cover"
                            fallback={
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#181818] text-[9px] font-bold text-[#C7F11D]">
                                    {activeNetwork.symbol.slice(0, 1)}
                                </div>
                            }
                        />
                        <span className="font-medium">
                            {activeNetwork.name}
                        </span>
                    </div>
                    <ChevronDown size={15} className="text-gray-400" />
                </button>
            </div>

            {/* Token Contract Address Input */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400">
                    Token Contract Address
                </label>
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={contractAddress}
                        onChange={handleAddressChange}
                        placeholder="0x..."
                        disabled={isLoading || preview !== null}
                        className="w-full rounded-xl border border-white/10 bg-[#121315] py-2.5 pl-3.5 pr-20 text-xs font-mono text-white placeholder-gray-600 outline-none focus:border-[#C7F11D] disabled:opacity-60"
                    />
                    {!preview && (
                        <button
                            type="button"
                            onClick={handlePaste}
                            className="absolute right-2 flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                        >
                            <Clipboard size={11} />
                            <span>Paste</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-400">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">{error}</div>
                </div>
            )}

            {/* Preview Card */}
            {preview && (
                <div className="rounded-2xl border border-[#536500] bg-[#050900] p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <div className="flex items-center gap-2.5">
                            {preview.logoUrl ? (
                                <ImageComp
                                    src={preview.logoUrl}
                                    alt={preview.symbol}
                                    size={30}
                                    className="rounded-full object-cover shrink-0"
                                    fallback={
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#181818] text-xs font-bold text-[#C7F11D]">
                                            {preview.symbol.slice(0, 1)}
                                        </div>
                                    }
                                />
                            ) : (
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#181818] text-xs font-bold text-[#C7F11D]">
                                    {preview.symbol.slice(0, 1)}
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2
                                    size={14}
                                    className="text-[#C7F11D]"
                                />
                                <span className="text-xs font-semibold text-white">
                                    Token Found
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setPreview(null)
                                setContractAddress('')
                            }}
                            className="text-[10px] text-gray-400 hover:text-white underline"
                        >
                            Change
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <p className="text-[10px] text-gray-500">
                                Token Name
                            </p>
                            <p className="font-semibold text-white mt-0.5">
                                {preview.name}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500">Symbol</p>
                            <p className="font-semibold text-[#C7F11D] mt-0.5">
                                {preview.symbol}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500">
                                Decimals
                            </p>
                            <p className="font-mono text-white mt-0.5">
                                {preview.decimals}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500">Network</p>
                            <p className="font-medium text-white mt-0.5">
                                {activeNetwork.name}
                            </p>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                        <p className="text-[10px] text-gray-500">Contract</p>
                        <p className="font-mono text-[10px] text-gray-400 break-all mt-0.5">
                            {preview.address}
                        </p>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="mt-2 flex flex-col gap-2">
                {!preview ? (
                    <Button
                        title={isLoading ? 'Verifying...' : 'Continue'}
                        variant="primary"
                        size="large"
                        width="full"
                        align="center"
                        disabled={!contractAddress.trim() || isLoading}
                        onClick={handleContinue}
                    />
                ) : (
                    <Button
                        title={isLoading ? 'Importing...' : 'Import Token'}
                        variant="primary"
                        size="large"
                        width="full"
                        align="center"
                        disabled={isLoading}
                        onClick={handleConfirmImport}
                    />
                )}

                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="py-2.5 text-center text-xs font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* Network Selector Sheet */}
            <SelectNetworkSheet
                isOpen={isNetworkSheetOpen}
                onClose={() => setIsNetworkSheetOpen(false)}
                activeNetwork={activeNetwork}
                networks={networks}
                onSelectNetwork={(net) => {
                    onSelectNetwork(net)
                    setIsNetworkSheetOpen(false)
                    setPreview(null)
                    setError(null)
                }}
            />
        </div>
    )
}

export default TokenImportForm
