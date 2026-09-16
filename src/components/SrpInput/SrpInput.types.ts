export interface SrpInputProps {
    words: string[]
    onChange: (words: string[]) => void
    showWords?: boolean
    wordCount?: 12 | 18 | 24
    invalidIndexes?: number[]
}