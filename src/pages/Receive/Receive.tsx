import React, { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Copy, Check, Share2, AlertCircle, ChevronDown, Wallet as WalletIcon } from 'lucide-react'
import { isAddress } from 'viem'
import type { RootState } from '../../store'
import Back from '../../components/Back/Back'
import { EVM_NETWORKS, type EVMNetwork } from '../../config/networks'
import { getActiveAddress, getActiveNetworkId } from '../../services/walletStorage'
import { SUPPORTED_TOKEN_CATALOG } from '../../services/token/tokenRegistry'
import QRCode from '../../components/QRCode/QRCode'
import SelectNetworkSheet from '../../components/sheets/SelectNetworkSheet/SelectNetworkSheet'
import SelectAssetSheet, { type ReceiveAssetItem } from '../../components/sheets/SelectAssetSheet/SelectAssetSheet'
import ImageComp from '../../components/ImageComp'
import { truncateEnd } from '../../utils/helpers'

export const Receive: React.FC = () => {
    const reduxAddress = useSelector((state: RootState) => state.wallet.address)
    const reduxWalletName = useSelector((state: RootState) => state.wallet.walletName)

    const [storedAddress, setStoredAddress] = useState<string | null>(null)
    const [storedWalletName, setStoredWalletName] = useState<string>('Account 1')
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const [activeNetwork, setActiveNetwork] = useState<EVMNetwork>(EVM_NETWORKS[0])
    const [isNetworkSheetOpen, setIsNetworkSheetOpen] = useState(false)
    const [isAssetSheetOpen, setIsAssetSheetOpen] = useState(false)

    const [copied, setCopied] = useState(false)
    const [shareMessage, setShareMessage] = useState<string | null>(null)

    // Load active network and active account address from storage as fallback
    useEffect(() => {
        Promise.all([getActiveAddress(), getActiveNetworkId()])
            .then(([{ address, walletName }, savedNetworkId]) => {
                if (address) {
                    setStoredAddress(address)
                    setStoredWalletName(walletName)
                }
                if (savedNetworkId) {
                    const found = EVM_NETWORKS.find((n) => n.id === savedNetworkId)
                    if (found) {
                        setActiveNetwork(found)
                    }
                }
            })
            .finally(() => {
                setIsLoading(false)
            })
    }, [])

    const rawAddress = reduxAddress ?? storedAddress
    const walletName = reduxWalletName ?? storedWalletName

    // Validate EVM address
    const isValid = useMemo(() => {
        return Boolean(rawAddress && isAddress(rawAddress))
    }, [rawAddress])

    // Build available assets list for current selected network
    const availableAssets: ReceiveAssetItem[] = useMemo(() => {
        const nativeItem: ReceiveAssetItem = {
            id: `native-${activeNetwork.chainId}`,
            name: activeNetwork.nativeCurrency.name,
            symbol: activeNetwork.nativeCurrency.symbol,
            decimals: activeNetwork.nativeCurrency.decimals,
            logoUrl: activeNetwork.icon,
            isNative: true,
        }

        const catalogTokens = SUPPORTED_TOKEN_CATALOG[activeNetwork.chainId] || []
        const tokenItems: ReceiveAssetItem[] = catalogTokens.map((t) => ({
            id: `${t.chainId}:${t.address.toLowerCase()}`,
            name: t.name,
            symbol: t.symbol,
            decimals: t.decimals,
            logoUrl: t.logoUrl,
            isNative: false,
            address: t.address,
        }))

        return [nativeItem, ...tokenItems]
    }, [activeNetwork])

    // Currently selected asset (defaults to native coin)
    const [selectedAsset, setSelectedAsset] = useState<ReceiveAssetItem>(availableAssets[0])

    // When network changes, keep asset if symbol matches or fallback to new network native
    const handleSelectNetwork = (net: EVMNetwork) => {
        setActiveNetwork(net)
        const newCatalog = SUPPORTED_TOKEN_CATALOG[net.chainId] || []
        const matchingToken = newCatalog.find(
            (t) => t.symbol.toLowerCase() === selectedAsset.symbol.toLowerCase()
        )

        if (matchingToken) {
            setSelectedAsset({
                id: `${net.chainId}:${matchingToken.address.toLowerCase()}`,
                name: matchingToken.name,
                symbol: matchingToken.symbol,
                decimals: matchingToken.decimals,
                logoUrl: matchingToken.logoUrl,
                isNative: false,
                address: matchingToken.address,
            })
        } else {
            // Default to network's native token
            setSelectedAsset({
                id: `native-${net.chainId}`,
                name: net.nativeCurrency.name,
                symbol: net.nativeCurrency.symbol,
                decimals: net.nativeCurrency.decimals,
                logoUrl: net.icon,
                isNative: true,
            })
        }
    }

    const handleCopy = async () => {
        if (!rawAddress) return
        try {
            await navigator.clipboard.writeText(rawAddress)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy address:', err)
        }
    }

    const handleShare = async () => {
        if (!rawAddress) return
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: `${walletName} Address`,
                    text: `My ${activeNetwork.name} address for receiving ${selectedAsset.symbol}:\n${rawAddress}`,
                })
                return
            } catch (err) {
                // User cancelled or share failed - fallback to copy
            }
        }

        // Fallback: Copy to clipboard and show message
        handleCopy()
        setShareMessage('Address copied to clipboard!')
        setTimeout(() => setShareMessage(null), 2500)
    }

    if (isLoading) {
        return (
            <div className="relative h-screen w-full bg-black text-[#FCFAF9] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5E5E5E]/20 border-t-[#48E5C2]" />
                    <p className="text-xs text-[#5E5E5E]">Loading receiving address...</p>
                </div>
            </div>
        )
    }

    if (!isValid || !rawAddress) {
        return (
            <div className="relative h-screen w-full bg-black text-[#FCFAF9] flex flex-col p-5">
                <Back />
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <AlertCircle size={36} className="text-red-400 mb-3" />
                    <h2 className="text-base font-semibold">Unable to load receiving address</h2>
                    <p className="mt-1 text-xs text-gray-500 max-w-xs">
                        Please ensure your wallet is unlocked and an active account is selected.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black text-white">
            {/* Background Glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#48E5C2] opacity-[0.02] blur-[100px]" />

            <div className="relative mx-auto flex h-full w-full max-w-md flex-col">
                <main className="flex-1 overflow-y-auto px-5 pb-6">
                    {/* Header */}
                    <div className="pt-4 flex items-center justify-between">
                        <Back />
                        <div className="flex items-center gap-1.5 rounded-full border border-[#5E5E5E]/30 bg-black px-3 py-1">
                            <WalletIcon size={12} className="text-[#48E5C2]" />
                            <span className="text-[11px] font-medium text-[#FCFAF9]">
                                {walletName}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 mb-4">
                        <h1 className="text-2xl font-semibold tracking-tight text-[#FCFAF9]">Receive</h1>
                        <p className="mt-1 text-xs text-[#5E5E5E]">
                            Scan QR code or share your address to receive funds.
                        </p>
                    </div>

                    {/* Selectors Row */}
                    <div className="grid grid-cols-2 gap-2.5 mb-5">
                        {/* Network Selector */}
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-[#5E5E5E]">
                                Network
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsNetworkSheetOpen(true)}
                                className="flex items-center justify-between rounded-xl border border-[#5E5E5E]/30 bg-black px-3 py-2.5 text-xs text-[#FCFAF9] hover:border-[#48E5C2] transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <ImageComp
                                        src={activeNetwork.icon}
                                        alt={activeNetwork.name}
                                        size={18}
                                        className="rounded-full object-cover shrink-0"
                                        fallback={
                                            <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-black border border-[#5E5E5E]/40 text-[8px] font-bold text-[#48E5C2]">
                                                {activeNetwork.symbol.slice(0, 1)}
                                            </div>
                                        }
                                    />
                                    <span className="truncate font-medium">
                                        {activeNetwork.name}
                                    </span>
                                </div>
                                <ChevronDown size={14} className="text-[#5E5E5E] shrink-0 ml-1" />
                            </button>
                        </div>

                        {/* Asset Selector */}
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-[#5E5E5E]">
                                Asset
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsAssetSheetOpen(true)}
                                className="flex items-center justify-between rounded-xl border border-[#5E5E5E]/30 bg-black px-3 py-2.5 text-xs text-[#FCFAF9] hover:border-[#48E5C2] transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    {selectedAsset.logoUrl ? (
                                        <ImageComp
                                            src={selectedAsset.logoUrl}
                                            alt={selectedAsset.symbol}
                                            size={18}
                                            className="rounded-full object-cover shrink-0"
                                            fallback={
                                                <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-black border border-[#5E5E5E]/40 text-[8px] font-bold text-[#48E5C2]">
                                                    {selectedAsset.symbol.slice(0, 1)}
                                                </div>
                                            }
                                        />
                                    ) : (
                                        <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-black border border-[#5E5E5E]/40 text-[8px] font-bold text-[#48E5C2]">
                                            {selectedAsset.symbol.slice(0, 1)}
                                        </div>
                                    )}
                                    <span className="truncate font-medium">
                                        {selectedAsset.symbol}
                                    </span>
                                </div>
                                <ChevronDown size={14} className="text-[#5E5E5E] shrink-0 ml-1" />
                            </button>
                        </div>
                    </div>

                    {/* QR Code Container */}
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-[#5E5E5E]/30 bg-black p-5">
                        <div className="relative rounded-2xl bg-white p-3 shadow-xl">
                            <QRCode value={rawAddress} size={180} />
                        </div>

                        <div className="mt-4 flex items-center gap-1.5 rounded-full border border-[#5E5E5E]/20 bg-black px-3 py-1 text-[11px] text-[#5E5E5E]">
                            <span>Network:</span>
                            <span className="font-semibold text-[#FCFAF9]">
                                {activeNetwork.name}
                            </span>
                        </div>
                    </div>

                    {/* Address Display Card */}
                    <div className="mt-4 rounded-xl border border-[#5E5E5E]/30 bg-black p-3.5">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] uppercase tracking-wider text-[#5E5E5E] font-medium">
                                Your Wallet Address
                            </span>
                        </div>
                        <p className="font-mono text-xs text-[#FCFAF9] break-all leading-relaxed select-all">
                            {rawAddress}
                        </p>
                    </div>

                    {/* Actions: Copy & Share */}
                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                        <button
                            type="button"
                            onClick={handleCopy}
                            className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-semibold transition-all cursor-pointer ${copied
                                ? 'bg-[#48E5C2] text-black'
                                : 'bg-[#48E5C2] text-black hover:opacity-95 active:scale-[0.98]'
                                }`}
                        >
                            {copied ? <Check size={15} /> : <Copy size={15} />}
                            <span>{copied ? 'Copied!' : 'Copy Address'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleShare}
                            className="flex items-center justify-center gap-2 rounded-xl border border-[#5E5E5E] bg-black py-3 px-4 text-xs font-medium text-[#FCFAF9] hover:border-[#48E5C2] hover:text-[#48E5C2] active:scale-[0.98] transition-all cursor-pointer"
                        >
                            <Share2 size={15} />
                            <span>Share Address</span>
                        </button>
                    </div>

                    {shareMessage && (
                        <p className="mt-2 text-center text-xs text-[#48E5C2] transition-all">
                            {shareMessage}
                        </p>
                    )}

                    {/* Dynamic Network Warning Banner */}
                    <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#5E5E5E]/30 bg-black/40 p-3.5 text-[#5E5E5E]">
                        <AlertCircle size={16} className="shrink-0 mt-0.5 text-[#48E5C2]" />
                        <div className="flex-1 text-[11px] leading-relaxed text-[#5E5E5E]">
                            Only send{' '}
                            <span className="font-bold text-[#FCFAF9]">
                                {selectedAsset.symbol}
                            </span>{' '}
                            on the{' '}
                            <span className="font-bold text-[#FCFAF9]">
                                {activeNetwork.name}
                            </span>{' '}
                            network. Sending any other asset or using a different network will
                            result in permanent loss of funds.
                        </div>
                    </div>
                </main>
            </div>

            {/* Network Selector Sheet */}
            <SelectNetworkSheet
                isOpen={isNetworkSheetOpen}
                onClose={() => setIsNetworkSheetOpen(false)}
                activeNetwork={activeNetwork}
                networks={EVM_NETWORKS}
                onSelectNetwork={(net) => {
                    handleSelectNetwork(net)
                    setIsNetworkSheetOpen(false)
                }}
            />

            {/* Asset Selector Sheet */}
            <SelectAssetSheet
                isOpen={isAssetSheetOpen}
                onClose={() => setIsAssetSheetOpen(false)}
                activeAsset={selectedAsset}
                assets={availableAssets}
                onSelectAsset={(asset) => {
                    setSelectedAsset(asset)
                    setIsAssetSheetOpen(false)
                }}
            />
        </div>
    )
}

export default Receive

