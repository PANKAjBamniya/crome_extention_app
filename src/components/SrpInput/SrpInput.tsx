import { useEffect, useRef } from 'react'
import { english } from 'viem/accounts'
import { SrpInputProps } from './SrpInput.types'

const englishWordSet = new Set(english)

const SrpInput = ({
    words,
    onChange,
    showWords = false,
    wordCount = 12,
    invalidIndexes = [],
}: SrpInputProps) => {

    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const updateWord = (index: number, value: string) => {
        const updated = [...words]

        updated[index] = value

        onChange(updated)
    }

    const focusInput = (index: number) => {
        if (index >= 0 && index < wordCount) {
            setTimeout(() => {
                inputRefs.current[index]?.focus()
            }, 0)
        }
    }

    const handleWordChange = (
        index: number,
        value: string
    ) => {
        // User typed a space
        if (value.includes(' ')) {

            const enteredWords = value
                .trim()
                .split(/\s+/)
                .filter(Boolean)

            if (enteredWords.length === 0) {
                return
            }

            const updated = [...words]

            enteredWords.forEach((word, wordIndex) => {
                const targetIndex = index + wordIndex

                if (targetIndex < wordCount) {
                    updated[targetIndex] = word
                }
            })

            onChange(updated)

            const nextIndex = Math.min(
                index + enteredWords.length,
                wordCount - 1
            )

            focusInput(nextIndex)

            return
        }

        updateWord(index, value)
    }

    const handleKeyDown = (
        index: number,
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {

        // Backspace
        if (event.key === 'Backspace') {

            // Current input has text
            if (words[index]) {
                return
            }

            // Current input empty → go previous
            if (index > 0) {

                event.preventDefault()

                const updated = [...words]

                updated[index - 1] = ''

                onChange(updated)

                focusInput(index - 1)
            }

            return
        }

        // Enter
        if (event.key === 'Enter') {

            event.preventDefault()

            if (index < wordCount - 1) {
                focusInput(index + 1)
            }
        }
    }

    const handlePaste = (
        index: number,
        event: React.ClipboardEvent<HTMLInputElement>
    ) => {

        event.preventDefault()

        const text = event.clipboardData.getData('text')

        const pastedWords = text
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, wordCount - index)

        if (pastedWords.length === 0) {
            return
        }

        const updated = [...words]

        pastedWords.forEach((word, wordIndex) => {
            const targetIndex = index + wordIndex

            if (targetIndex < wordCount) {
                updated[targetIndex] = word
            }
        })

        onChange(updated)

        const nextIndex = Math.min(
            index + pastedWords.length,
            wordCount - 1
        )

        focusInput(nextIndex)
    }

    useEffect(() => {
        inputRefs.current[0]?.focus()
    }, [])

    return (
        <div className="grid grid-cols-3 gap-2">

            {Array.from({ length: wordCount }).map((_, index) => {

                const word = words[index] || ''
                const trimmed = word.trim().toLowerCase()
                const isInvalidWord = trimmed !== '' && !englishWordSet.has(trimmed)
                const isInvalid = invalidIndexes.includes(index) || isInvalidWord

                return (
                    <input
                        key={index}
                        ref={element => {
                            inputRefs.current[index] = element
                        }}
                        type={showWords ? 'text' : 'password'}
                        value={word}
                        onChange={event =>
                            handleWordChange(
                                index,
                                event.target.value
                            )
                        }
                        onKeyDown={event =>
                            handleKeyDown(index, event)
                        }
                        onPaste={event =>
                            handlePaste(index, event)
                        }
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        className={`
                            h-10
                            w-full
                            rounded-lg
                            border
                            px-2
                            text-center
                            text-[11px]
                            text-white
                            outline-none
                            transition-all
                            duration-200
                            ${isInvalid
                                ? 'border-red-500 bg-red-500/10 focus:border-red-500'
                                : 'border-[#20251A] bg-[#090C05] focus:border-cryptiva-primary focus:bg-[#0C1006]'
                            }
                        `}
                    />
                )
            })}

        </div>
    )
}

export default SrpInput