import { ReactNode } from 'react'

export type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'danger'

export type ButtonSize =
    | 'small'
    | 'medium'
    | 'large'

export type ButtonWidth =
    | 'full'
    | 'auto'
    | 'half'

export type ButtonAlign =
    | 'left'
    | 'center'
    | 'right'

export type ButtonType =
    | 'button'
    | 'submit'
    | 'reset'

export interface ButtonProps {
    title: string

    onClick?: () => void

    variant?: ButtonVariant

    size?: ButtonSize

    width?: ButtonWidth

    align?: ButtonAlign

    type?: ButtonType

    disabled?: boolean

    loading?: boolean

    icon?: ReactNode

    iconPosition?: 'left' | 'right'

    bold?: boolean

    className?: string

    titleClassName?: string
}