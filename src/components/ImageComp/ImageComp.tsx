import React, { useState } from 'react'
import { ImageCompProps } from './ImageComp.types'

const ImageComp: React.FC<ImageCompProps> = ({
    src,
    alt = '',
    className = '',
    size,
    fallback,
    style,
    onError,
    ...rest
}) => {
    const [hasError, setHasError] = useState(false)

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setHasError(true)
        if (onError) {
            onError(e)
        }
    }

    const sizeStyle = size
        ? {
            width: typeof size === 'number' ? `${size}px` : size,
            height: typeof size === 'number' ? `${size}px` : size,
        }
        : undefined

    if (!src || hasError) {
        if (fallback) {
            return <>{fallback}</>
        }
        return (
            <div
                className={`flex items-center justify-center bg-white/10 text-gray-400 text-xs font-semibold ${className}`}
                style={{ ...sizeStyle, ...style }}
                aria-label={alt}
            >
                {alt ? alt.slice(0, 3).toUpperCase() : ''}
            </div>
        )
    }

    return (
        <img
            src={src}
            alt={alt}
            onError={handleError}
            className={className}
            style={{ ...sizeStyle, ...style }}
            {...rest}
        />
    )
}

export default ImageComp

