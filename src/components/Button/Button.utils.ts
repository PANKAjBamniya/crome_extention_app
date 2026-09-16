import {
    BUTTON_ALIGNS,
    BUTTON_SIZES,
    BUTTON_VARIANTS,
    BUTTON_WIDTHS,
} from './Button.constants'

import {
    ButtonAlign,
    ButtonSize,
    ButtonVariant,
    ButtonWidth,
} from './Button.types'

export const getButtonClasses = ({
    variant,
    size,
    width,
    align,
}: {
    variant: ButtonVariant
    size: ButtonSize
    width: ButtonWidth
    align: ButtonAlign
}) => {
    return [
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        BUTTON_WIDTHS[width],
        BUTTON_ALIGNS[align],
    ]
        .filter(Boolean)
        .join(' ')
}