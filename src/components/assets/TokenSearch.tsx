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
            <div className="pointer-events-none absolute left-3.5 flex items-center text-gray-500">
                <Search size={16} />
            </div>

            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-white/10 bg-[#121315] py-2.5 pl-10 pr-9 text-xs text-white placeholder-gray-500 outline-none transition-colors focus:border-[#C7F11D]"
            />

            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full text-gray-500 hover:bg-white/10 hover:text-white"
                    aria-label="Clear search"
                >
                    <X size={12} />
                </button>
            )}
        </div>
    )
}

export default TokenSearch

