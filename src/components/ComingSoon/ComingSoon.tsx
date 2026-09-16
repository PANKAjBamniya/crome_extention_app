import { Clock3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button'

const ComingSoon = () => {
    const navigate = useNavigate()

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black text-white">

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
                    bg-[#C7F11D]
                    opacity-[0.035]
                    blur-[100px]
                "
            />

            <div className="relative mx-auto flex h-full w-full max-w-md flex-col">

                {/* Content */}
                <main className="flex flex-1 items-center justify-center px-5">

                    <div className="flex w-full flex-col items-center text-center">

                        {/* Icon */}
                        <div
                            className="
                                mb-6
                                flex
                                h-16
                                w-16
                                items-center
                                justify-center
                                rounded-2xl
                                border
                                border-[#536500]
                                bg-[#050900]
                                text-[#C7F11D]
                            "
                        >
                            <Clock3 size={28} strokeWidth={1.5} />
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight">
                            Coming Soon
                        </h1>

                        <p className="mt-3 max-w-xs text-xs leading-5 text-gray-500">
                            This page is currently under development.
                            Please check back soon.
                        </p>

                    </div>

                </main>

                {/* Bottom Action */}
                <div className="shrink-0 px-5 pb-5">
                    <Button
                        title="Go Back"
                        variant="primary"
                        size="large"
                        width="full"
                        align="center"
                        onClick={() => navigate(-1)}
                    />
                </div>

            </div>
        </div>
    )
}

export default ComingSoon
