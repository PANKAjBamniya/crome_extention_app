import React from 'react'

export interface ImageCompProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src?: string
    alt?: string
    className?: string
    size?: number | string
    fallback?: React.ReactNode
}

