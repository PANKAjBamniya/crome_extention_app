import React from 'react'
import { Plus } from 'lucide-react'

interface AddTokenButtonProps {
    onClick: () => void
    className?: string
}

export const AddTokenButton: React.FC<AddTokenButtonProps> = ({
    onClick,
    className = '',
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] py-3 text-xs font-medium text-gray-300 transition-all hover:border-[#C7F11D]/50 hover:bg-[#C7F11D]/5 hover:text-[#C7F11D] active:scale-[0.99] ${className}`}
        >
            <Plus size={15} />
            <span>Add Token</span>
        </button>
    )
}

export default AddTokenButton

