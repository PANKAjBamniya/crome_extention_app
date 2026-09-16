import React from 'react'

import {
    ButtonProps,
} from './Button.types'

import {
    getButtonClasses,
} from './Button.utils'

const Button: React.FC<ButtonProps> = ({
    title,
    onClick,

    variant = 'primary',
    size = 'large',
    width = 'full',
    align = 'center',

    type = 'button',

    disabled = false,
    loading = false,

    icon,
    iconPosition = 'right',

    bold = false,

    className = '',
    titleClassName = '',
}) => {

    const buttonClasses = getButtonClasses({
        variant,
        size,
        width,
        align,
    })

    const isDisabled = disabled || loading

    return (
        <button
            type={type}
            disabled={isDisabled}
            onClick={onClick}
            className={`
                    ${buttonClasses}
                    rounded-[10px]
                    flex
                    items-center
                    ${icon ? 'justify-between' : 'justify-center'}
                    gap-3
                    transition-all
                    duration-200
                    active:scale-[0.99]
                    ${isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }
                    ${className}
                `}
        >
            {loading ? (
                <span
                    className="
                        h-5
                        w-5
                        rounded-full
                        border-2
                        border-current
                        border-t-transparent
                        animate-spin
                    "
                />
            ) : (
                <>
                    {icon && iconPosition === 'left' && (
                        <span className="shrink-0">
                            {icon}
                        </span>
                    )}

                    <span
                        className={`
                            truncate
                            ${bold ? 'font-bold' : 'font-medium'}
                            ${titleClassName}
                        `}
                    >
                        {title}
                    </span>

                    {icon && iconPosition === 'right' && (
                        <span className="shrink-0">
                            {icon}
                        </span>
                    )}
                </>
            )}
        </button>
    )
}

export default Button