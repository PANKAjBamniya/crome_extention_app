import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Back = () => {
    const navigate = useNavigate()

    return (
        <button
            type="button"
            onClick={() => navigate(-1)}
            className="
                mt-5
                mb-7
                flex
                items-center
                gap-2
                text-[#5E5E5E]
                transition-colors
                duration-200
                hover:text-[#FCFAF9]
            "
        >
            <ArrowLeft size={18} strokeWidth={1.6} />

            <span className="text-xs">
                Back
            </span>
        </button>
    )
}

export default Back