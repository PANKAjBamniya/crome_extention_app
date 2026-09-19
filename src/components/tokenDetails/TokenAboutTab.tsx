import React, { useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'
import type { TokenDetails } from '../../types/tokenDetails'

interface TokenAboutTabProps {
    token: TokenDetails
}

export const TokenAboutTab: React.FC<TokenAboutTabProps> = ({ token }) => {
    const [copied, setCopied] = useState(false)

    const handleCopyAddress = async () => {
        if (!token.contractAddress) return
        try {
            await navigator.clipboard.writeText(token.contractAddress)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Clipboard error handling
        }
    }

    const formattedAddress = token.contractAddress
        ? `${token.contractAddress.slice(0, 10)}...${token.contractAddress.slice(-8)}`
        : 'Native Blockchain Currency'

    return (
        <div className="flex flex-col gap-4 select-none">
            {/* Description */}
            {token.description && (
                <div className="rounded-xl border border-[#1A222F] bg-[#0D121A] p-4 shadow-md">
                    <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#8E9BAE]">
                        About {token.name}
                    </h4>
                    <p className="text-xs leading-relaxed text-[#FCFAF9]/90">
                        {token.description}
                    </p>
                </div>
            )}

            {/* Token Specifications */}
            <div className="rounded-xl border border-[#1A222F] bg-[#0D121A] p-4 shadow-md space-y-3">
                <h4 className="border-b border-[#1A222F] pb-2 text-[11px] font-bold uppercase tracking-wider text-[#8E9BAE]">
                    Asset Details
                </h4>

                {/* Contract Address */}
                <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8E9BAE]">Contract Address</span>
                    {token.contractAddress ? (
                        <button
                            type="button"
                            onClick={handleCopyAddress}
                            className="flex items-center gap-1.5 font-mono text-xs text-[#48E5C2] hover:underline cursor-pointer"
                        >
                            <span>{formattedAddress}</span>
                            {copied ? (
                                <Check size={12} className="text-[#48E5C2]" />
                            ) : (
                                <Copy size={12} className="text-[#8E9BAE]" />
                            )}
                        </button>
                    ) : (
                        <span className="font-mono text-[#FCFAF9]">{formattedAddress}</span>
                    )}
                </div>

                {/* Network */}
                <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8E9BAE]">Network</span>
                    <span className="font-medium text-[#FCFAF9]">{token.networkName}</span>
                </div>

                {/* Token Standard */}
                <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8E9BAE]">Standard</span>
                    <span className="font-medium text-[#48E5C2]">{token.tokenStandard || 'ERC-20'}</span>
                </div>

                {/* Decimals */}
                <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8E9BAE]">Decimals</span>
                    <span className="font-mono text-[#FCFAF9]">{token.decimals}</span>
                </div>

                {/* Explorer Link */}
                {token.explorerUrl && (
                    <div className="flex items-center justify-between border-t border-[#1A222F] pt-3 text-xs">
                        <span className="text-[#8E9BAE]">Block Explorer</span>
                        <a
                            href={token.explorerUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 font-medium text-[#48E5C2] hover:underline cursor-pointer"
                        >
                            <span>View details</span>
                            <ExternalLink size={12} />
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TokenAboutTab
