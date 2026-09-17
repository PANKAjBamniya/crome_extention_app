import {
    ButtonAlign,
    ButtonSize,
    ButtonVariant,
    ButtonWidth,
} from './Button.types'

export const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
    primary: `
    bg-[#48E5C2]
    text-black
    border
    border-[#48E5C2]
    hover:bg-[#48E5C2]/90
    hover:border-[#48E5C2]
    transition-all
    duration-200
`,

    secondary: `
    bg-transparent
    text-[#FCFAF9]
    border
    border-[#5E5E5E]
    hover:border-[#48E5C2]
    hover:text-[#48E5C2]
    transition-all
    duration-200
`,

    outline: `
        bg-transparent
        text-[#FCFAF9]
        border
        border-[#5E5E5E]
        hover:border-[#48E5C2]
    `,

    ghost: `
        bg-transparent
        text-[#5E5E5E]
        border
        border-transparent
        hover:text-[#FCFAF9]
    `,

    danger: `
        bg-red-600
        text-[#FCFAF9]
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