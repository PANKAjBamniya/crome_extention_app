import {
    ButtonAlign,
    ButtonSize,
    ButtonVariant,
    ButtonWidth,
} from './Button.types'

export const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
    primary: `
    bg-[#C7F11D]
    text-black
    border
    border-[#C7F11D]
    hover:bg-[#C7F11D]
    hover:border-[#C7F11D]
    transition-all
    duration-200
`,

    secondary: `
    bg-transparent
    text-white
    border
    border-gray-600
    hover:bg-[#151515]
    hover:border-gray-400
    transition-all
    duration-200
`,

    outline: `
        bg-transparent
        text-white
        border
        border-gray-700
        hover:bg-[#111111]
    `,

    ghost: `
        bg-transparent
        text-gray-300
        border
        border-transparent
        hover:bg-[#151515]
    `,

    danger: `
        bg-red-600
        text-white
        border
        border-red-600
        hover:bg-red-700
    `,
}

export const BUTTON_SIZES: Record<ButtonSize, string> = {
    small: `
        min-h-9
        px-3
        text-xs
    `,

    medium: `
        min-h-11
        px-4
        text-sm
    `,

    large: `
        min-h-12
        px-5
        text-[15px]
    `,
}

export const BUTTON_WIDTHS: Record<ButtonWidth, string> = {
    full: 'w-full',

    auto: 'w-auto',

    half: 'w-1/2',
}

export const BUTTON_ALIGNS: Record<ButtonAlign, string> = {
    left: 'mr-auto',

    center: 'mx-auto',

    right: 'ml-auto',
}