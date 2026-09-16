export const truncateEnd = (
    value: string = '',
    maxLength = 10
): string => {
    if (!value) return ''

    if (value.length <= maxLength) {
        return value
    }

    return `${value.slice(0, maxLength)}...`
}

