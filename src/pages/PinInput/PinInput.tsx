import { Delete } from 'lucide-react'

interface PinInputProps {
    password: string
    onChange: (value: string) => void
    disabled?: boolean
    error?: string
    showPassword?: boolean
}

const PinInput = ({
    password,
    onChange,
    disabled = false,
    error,
    showPassword = false,
}: PinInputProps) => {

    const handlePress = (num: string) => {
        if (disabled || password.length >= 6) return

        onChange(password + num)
    }

    const handleBackspace = () => {
        if (disabled || password.length === 0) return

        onChange(password.slice(0, -1))
    }

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLDivElement>
    ) => {
        if (event.key >= '0' && event.key <= '9') {
            event.preventDefault()
            handlePress(event.key)
        }

        if (event.key === 'Backspace') {
            event.preventDefault()
            handleBackspace()
        }
    }

    return (
        <div
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="flex w-full flex-col items-center outline-none"
        >
            {/* PIN */}
            <div className="rounded-xl border border-[#293C0D] bg-[#041A09] p-3">
                <div className="flex gap-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className={`
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-lg
                                border
                                ${password.length > index
                                    ? 'border-[#C7F11D] bg-[#C7F11D0A]'
                                    : 'border-[#293C0D] bg-[#010B04]'
                                }
                            `}
                        >
                            {password.length > index && (
                                <span className="text-sm font-medium text-white">
                                    {showPassword
                                        ? password[index]
                                        : '•'}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <p className="mt-3 text-center text-xs text-red-500">
                    {error}
                </p>
            )}

            {/* Keypad */}
            <div className="mt-7 w-full max-w-[300px]">
                {[
                    ['1', '2', '3'],
                    ['4', '5', '6'],
                    ['7', '8', '9'],
                ].map((row, rowIndex) => (
                    <div
                        key={rowIndex}
                        className="mb-4 flex justify-center gap-4"
                    >
                        {row.map(num => (
                            <button
                                key={num}
                                type="button"
                                disabled={disabled}
                                onClick={() => handlePress(num)}
                                className="
                                    flex
                                    h-16
                                    w-16
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-[#536500]
                                    text-2xl
                                    text-black
                                    transition-all
                                    hover:bg-[#C7F11D]
                                    active:scale-95
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                ))}

                {/* Bottom row */}
                <div className="flex justify-center gap-4">
                    <div className="h-16 w-16" />

                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handlePress('0')}
                        className="
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-full
                            bg-[#536500]
                            text-2xl
                            text-black
                            transition-all
                            hover:bg-[#C7F11D]
                            active:scale-95
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        0
                    </button>

                    <button
                        type="button"
                        disabled={disabled || password.length === 0}
                        onClick={handleBackspace}
                        className="
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-full
                            text-gray-400
                            transition-all
                            hover:bg-white/5
                            hover:text-white
                            active:scale-95
                            disabled:cursor-not-allowed
                            disabled:opacity-30
                        "
                    >
                        <Delete size={24} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PinInput