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
            className={`flex w-full items-center justify-center gap-2 rounded-xl border border-[#48E5C2]/30 bg-[#48E5C2]/10 py-2.5 text-xs font-semibold text-[#48E5C2] transition-all hover:bg-[#48E5C2]/20 hover:border-[#48E5C2] active:scale-[0.99] cursor-pointer ${className}`}
        >
            <Plus size={15} strokeWidth={2.2} />
            <span>Add Token</span>
        </button>
    )
}

export default AddTokenButton
