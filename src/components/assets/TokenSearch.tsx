import React from 'react'
import { Search, X } from 'lucide-react'

interface TokenSearchProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export const TokenSearch: React.FC<TokenSearchProps> = ({
    value,
    onChange,
    placeholder = 'Search token by name or symbol',
    className = '',
}) => {
    return (
        <div className={`relative flex items-center ${className}`}>
            <div className="pointer-events-none absolute left-3.5 flex items-center text-[#5E5E5E]">
                <Search size={16} />
            </div>

            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-[#5E5E5E]/30 bg-black py-2.5 pl-10 pr-9 text-xs text-[#FCFAF9] placeholder-[#5E5E5E] outline-none transition-colors focus:border-[#48E5C2]"
            />

            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full text-[#5E5E5E] hover:bg-[#5E5E5E]/20 hover:text-[#FCFAF9]"
                    aria-label="Clear search"
                >
                    <X size={12} />
                </button>
            )}
        </div>
    )
}

export default TokenSearch

