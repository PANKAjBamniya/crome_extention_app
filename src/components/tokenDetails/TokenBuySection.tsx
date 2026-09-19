import React, { useState } from 'react'
import type { TokenBuyQuote } from '../../types/tokenDetails'

interface TokenBuySectionProps {
    symbol: string
    tokenPriceUsd: number
    initialQuote?: TokenBuyQuote
    rateText?: string
    onBuy?: (amount: number, currency: string) => void
}

export const TokenBuySection: React.FC<TokenBuySectionProps> = ({
    symbol,
    tokenPriceUsd,
    initialQuote,
    rateText,
    onBuy,
}) => {
    const usdToInrRate = 83.5
    const tokenPriceInr = Math.max(0.0001, tokenPriceUsd * usdToInrRate)

    const currency = initialQuote?.fiatCurrency || 'INR'
    const quickAmounts = initialQuote?.quickAmounts || [1900, 2900, 5700, 9600]

    const [fiatAmount, setFiatAmount] = useState<number>(2900)
    const [inputValue, setInputValue] = useState<string>('2,900')

    const calculateEstimatedTokens = (amount: number): string => {
        if (!amount || amount <= 0) return '0.00'
        const est = amount / tokenPriceInr
        if (est >= 1) {
            return est.toFixed(4)
        }
        return est.toFixed(6)
    }

    const handleAmountSelect = (amt: number) => {
        setFiatAmount(amt)
        setInputValue(amt.toLocaleString('en-IN'))
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawVal = e.target.value.replace(/[^0-9]/g, '')
        if (!rawVal) {
            setInputValue('')
            setFiatAmount(0)
            return
        }
        const num = parseInt(rawVal, 10)
        setFiatAmount(num)
        setInputValue(num.toLocaleString('en-IN'))
    }

    const handleBuyClick = () => {
        onBuy?.(fiatAmount, currency)
    }

    const displayRate = rateText || `Rate: 1 ${symbol} ≈ $${tokenPriceUsd >= 1 ? Math.round(tokenPriceUsd).toLocaleString() : tokenPriceUsd.toFixed(4)}`

    return (
        <div className="rounded-2xl border border-[#1A222F] bg-[#0D121A] p-4 shadow-lg transition-all">
            {/* Header: Glowing Dot + Title + Rate */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#48E5C2] shadow-[0_0_8px_#48E5C2]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FCFAF9]">
                        INSTANT BUY & SWAP
                    </span>
                </div>
                <span className="text-[11px] font-medium text-[#8E9BAE]">
                    {displayRate}
                </span>
            </div>

            {/* Input Card: PAY WITH INR / USD */}
            <div className="mt-3 rounded-xl border border-[#1E2738] bg-[#131924] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8E9BAE]">
                    PAY WITH INR / USD
                </p>

                <div className="mt-1 flex items-center justify-between">
                    {/* Currency Symbol + Large Amount */}
                    <div className="flex items-center gap-1.5 flex-1">
                        <span className="text-xl font-bold text-[#FCFAF9]">₹</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder="0"
                            className="w-full bg-transparent font-mono text-xl font-bold text-[#FCFAF9] outline-none"
                        />
                    </div>

                    {/* Currency Badge + Buy Button */}
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="rounded-lg border border-[#232D3F] bg-[#1A2230] px-2.5 py-1.5 text-xs font-semibold text-[#FCFAF9]">
                            {currency}
                        </span>
                        <button
                            type="button"
                            onClick={handleBuyClick}
                            disabled={fiatAmount <= 0}
                            className="rounded-lg bg-[#48E5C2] hover:bg-[#3cd3b0] active:scale-98 px-4 py-1.5 text-xs font-bold text-[#0B0E14] transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Buy
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Amount Chips */}
            <div className="mt-3 grid grid-cols-4 gap-2">
                {quickAmounts.map((amt) => {
                    const isSelected = fiatAmount === amt
                    return (
                        <button
                            key={amt}
                            type="button"
                            onClick={() => handleAmountSelect(amt)}
                            className={`rounded-xl py-1.5 text-center text-xs font-medium transition-all cursor-pointer ${isSelected
                                    ? 'border border-[#48E5C2] bg-[#48E5C2]/10 text-[#48E5C2] font-semibold shadow-[0_0_10px_rgba(72,229,194,0.15)]'
                                    : 'border border-[#1E2738] bg-[#131924] text-[#8E9BAE] hover:text-[#FCFAF9] hover:border-[#2b374d]'
                                }`}
                        >
                            ₹{amt.toLocaleString('en-IN')}
                        </button>
                    )
                })}
            </div>

            {/* Footer Summary: Receive Tokens + Details */}
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#8E9BAE] flex-wrap">
                <span>
                    Receive: <strong className="font-semibold text-[#FCFAF9]">~{calculateEstimatedTokens(fiatAmount)} {symbol}</strong>
                </span>
                <span className="text-[#48E5C2] text-[8px]">●</span>
                <span>{initialQuote?.paymentMethod || 'Bank Transfer'}</span>
                <span className="text-[#48E5C2] text-[8px]">●</span>
                <span>{initialQuote?.provider || 'Swapped.com'}</span>
            </div>
        </div>
    )
}

export default TokenBuySection
