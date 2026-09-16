import React from 'react'

export interface BottomSheetProps {
    visible: boolean
    onClose: () => void
    children: React.ReactNode
    position?: 'top' | 'bottom'
    snapPoints?: (string | number)[]
    initialSnapPoint?: string | number
    closeOnBackdropPress?: boolean
    showDragHandle?: boolean
    className?: string
    backdropClassName?: string
}


