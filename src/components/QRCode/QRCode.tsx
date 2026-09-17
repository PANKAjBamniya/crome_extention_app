import React from 'react'

/**
 * Self-contained, zero-dependency QR Code generator adhering to ISO/IEC 18004.
 * Generates an SVG path representing the QR matrix for any arbitrary string (such as EVM addresses).
 */

// GF(256) Math for Reed-Solomon error correction
const EXP_TABLE = new Uint8Array(512)
const LOG_TABLE = new Uint8Array(256)

    ; (() => {
        let x = 1
        for (let i = 0; i < 255; i++) {
            EXP_TABLE[i] = x
            EXP_TABLE[i + 255] = x
            LOG_TABLE[x] = i
            x = (x << 1) ^ (x >= 128 ? 0x11d : 0)
        }
    })()

const gfMul = (x: number, y: number): number => {
    if (x === 0 || y === 0) return 0
    return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]]
}

const rsGenPoly = (numEcc: number): Uint8Array => {
    let poly = new Uint8Array([1])
    for (let i = 0; i < numEcc; i++) {
        const next = new Uint8Array(poly.length + 1)
        const factor = EXP_TABLE[i]
        for (let j = 0; j < poly.length; j++) {
            next[j] ^= poly[j]
            next[j + 1] ^= gfMul(poly[j], factor)
        }
        poly = next
    }
    return poly
}

const rsComputeEcc = (data: Uint8Array, numEcc: number): Uint8Array => {
    const gen = rsGenPoly(numEcc)
    const result = new Uint8Array(numEcc)
    for (let i = 0; i < data.length; i++) {
        const factor = data[i] ^ result[0]
        result.copyWithin(0, 1)
        result[numEcc - 1] = 0
        for (let j = 0; j < numEcc; j++) {
            result[j] ^= gfMul(gen[j + 1], factor)
        }
    }
    return result
}

// Table of QR versions (Version 1 to 6) for Byte Mode (ECC Level M)
// Version, Size, Total Codewords, ECC Codewords per block, Blocks
interface VersionInfo {
    version: number
    size: number
    dataCapacity: number
    totalCodewords: number
    eccCodewords: number
    blocks: number
    alignments: number[]
}

const VERSIONS: VersionInfo[] = [
    { version: 1, size: 21, dataCapacity: 14, totalCodewords: 26, eccCodewords: 10, blocks: 1, alignments: [] },
    { version: 2, size: 25, dataCapacity: 26, totalCodewords: 44, eccCodewords: 16, blocks: 1, alignments: [6, 18] },
    { version: 3, size: 29, dataCapacity: 42, totalCodewords: 70, eccCodewords: 26, blocks: 1, alignments: [6, 22] },
    { version: 4, size: 33, dataCapacity: 62, totalCodewords: 100, eccCodewords: 18, blocks: 2, alignments: [6, 26] },
    { version: 5, size: 37, dataCapacity: 84, totalCodewords: 134, eccCodewords: 24, blocks: 2, alignments: [6, 30] },
    { version: 6, size: 41, dataCapacity: 106, totalCodewords: 172, eccCodewords: 16, blocks: 4, alignments: [6, 34] },
]

export const generateQrMatrix = (text: string): boolean[][] => {
    const textBytes = new TextEncoder().encode(text)
    const charCount = textBytes.length

    // Pick smallest version that can hold Byte mode data:
    // Header = 4 bits (mode) + 8 bits (length) = 12 bits (or 16 bits for ver > 9)
    let selectedVersion: VersionInfo | null = null
    for (const v of VERSIONS) {
        if (charCount + 2 <= v.dataCapacity) {
            selectedVersion = v
            break
        }
    }

    if (!selectedVersion) {
        selectedVersion = VERSIONS[VERSIONS.length - 1]
    }

    const { size, dataCapacity, totalCodewords, eccCodewords, blocks, alignments } = selectedVersion

    // 1. Bit Buffer (Mode = Byte: 0100, 8-bit count)
    const bits: number[] = [0, 1, 0, 0]
    for (let i = 7; i >= 0; i--) {
        bits.push((charCount >> i) & 1)
    }
    for (const byte of textBytes) {
        for (let i = 7; i >= 0; i--) {
            bits.push((byte >> i) & 1)
        }
    }

    // Terminator (up to 4 zeroes)
    const maxDataBits = dataCapacity * 8
    while (bits.length < maxDataBits && bits.length % 8 !== 0) {
        bits.push(0)
    }
    for (let i = 0; i < 4 && bits.length < maxDataBits; i++) {
        bits.push(0)
    }
    while (bits.length % 8 !== 0) {
        bits.push(0)
    }

    // Pad bytes 0xEC, 0x11
    const padBytes = [0xec, 0x11]
    let padIndex = 0
    while (bits.length < maxDataBits) {
        const p = padBytes[padIndex % 2]
        for (let i = 7; i >= 0; i--) {
            bits.push((p >> i) & 1)
        }
        padIndex++
    }

    // Convert bits to data codewords
    const dataCodewords = new Uint8Array(dataCapacity)
    for (let i = 0; i < dataCapacity; i++) {
        let byteVal = 0
        for (let b = 0; b < 8; b++) {
            byteVal = (byteVal << 1) | (bits[i * 8 + b] || 0)
        }
        dataCodewords[i] = byteVal
    }

    // 2. Reed-Solomon per block
    const dataPerBlock = Math.floor(dataCapacity / blocks)
    const eccPerBlock = Math.floor(eccCodewords / blocks)
    const allEcc: Uint8Array[] = []
    const allData: Uint8Array[] = []

    for (let b = 0; b < blocks; b++) {
        const start = b * dataPerBlock
        const blockData = dataCodewords.slice(start, start + dataPerBlock)
        const blockEcc = rsComputeEcc(blockData, eccPerBlock)
        allData.push(blockData)
        allEcc.push(blockEcc)
    }

    // Interleave codewords
    const finalCodewords = new Uint8Array(totalCodewords)
    let ptr = 0
    for (let i = 0; i < dataPerBlock; i++) {
        for (let b = 0; b < blocks; b++) {
            finalCodewords[ptr++] = allData[b][i]
        }
    }
    for (let i = 0; i < eccPerBlock; i++) {
        for (let b = 0; b < blocks; b++) {
            finalCodewords[ptr++] = allEcc[b][i]
        }
    }

    // 3. Setup Matrix
    const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => null)
    )

    // Helper: place finder pattern (7x7 with separator)
    const placeFinder = (r: number, c: number) => {
        for (let dr = -1; dr <= 7; dr++) {
            for (let dc = -1; dc <= 7; dc++) {
                const nr = r + dr
                const nc = c + dc
                if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
                    if (dr === -1 || dr === 7 || dc === -1 || dc === 7) {
                        matrix[nr][nc] = false // separator
                    } else if (
                        dr === 0 ||
                        dr === 6 ||
                        dc === 0 ||
                        dc === 6 ||
                        (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4)
                    ) {
                        matrix[nr][nc] = true
                    } else {
                        matrix[nr][nc] = false
                    }
                }
            }
        }
    }

    placeFinder(0, 0)
    placeFinder(0, size - 7)
    placeFinder(size - 7, 0)

    // Helper: Alignment pattern (5x5)
    const placeAlignment = (r: number, c: number) => {
        for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
                const nr = r + dr
                const nc = c + dc
                if (matrix[nr][nc] === null) {
                    if (Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0)) {
                        matrix[nr][nc] = true
                    } else {
                        matrix[nr][nc] = false
                    }
                }
            }
        }
    }

    if (alignments.length > 0) {
        for (const ar of alignments) {
            for (const ac of alignments) {
                // Skip if overlapping with finders
                if (
                    (ar <= 8 && ac <= 8) ||
                    (ar <= 8 && ac >= size - 8) ||
                    (ar >= size - 8 && ac <= 8)
                ) {
                    continue
                }
                placeAlignment(ar, ac)
            }
        }
    }

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
        if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0
        if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0
    }

    // Dark module
    matrix[size - 8][8] = true

    // Reserve format information areas
    for (let i = 0; i <= 8; i++) {
        if (matrix[8][i] === null) matrix[8][i] = false
        if (matrix[i][8] === null) matrix[i][8] = false
    }
    for (let i = 0; i < 8; i++) {
        if (matrix[8][size - 1 - i] === null) matrix[8][size - 1 - i] = false
        if (matrix[size - 1 - i][8] === null) matrix[size - 1 - i][8] = false
    }

    // 4. Place Data Bits
    const allBits: number[] = []
    for (const byte of finalCodewords) {
        for (let b = 7; b >= 0; b--) {
            allBits.push((byte >> b) & 1)
        }
    }

    let bitIdx = 0
    let upward = true
    for (let right = size - 1; right > 0; right -= 2) {
        if (right === 6) right-- // skip vertical timing
        const left = right - 1
        const rows = upward
            ? Array.from({ length: size }, (_, i) => size - 1 - i)
            : Array.from({ length: size }, (_, i) => i)

        for (const row of rows) {
            for (const col of [right, left]) {
                if (matrix[row][col] === null) {
                    const b = bitIdx < allBits.length ? allBits[bitIdx++] : 0
                    // Default mask 0: (row + col) % 2 === 0
                    const mask = (row + col) % 2 === 0
                    matrix[row][col] = Boolean(b ^ (mask ? 1 : 0))
                }
            }
        }
        upward = !upward
    }

    // 5. Format info (Level M, Mask 0 = 0b00000 ^ 0b101010000010010 = 101010000010010)
    // Precalculated format bits for ECC Level M, Mask 0 with BCH (15, 5): 0x5412
    const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0]

    // Top-left
    for (let i = 0; i <= 5; i++) matrix[8][i] = Boolean(formatBits[i])
    matrix[8][7] = Boolean(formatBits[6])
    matrix[8][8] = Boolean(formatBits[7])
    matrix[7][8] = Boolean(formatBits[8])
    for (let i = 9; i < 15; i++) matrix[14 - i][8] = Boolean(formatBits[i])

    // Bottom-left & Top-right
    for (let i = 0; i < 7; i++) matrix[size - 1 - i][8] = Boolean(formatBits[i])
    for (let i = 0; i < 8; i++) matrix[8][size - 8 + i] = Boolean(formatBits[7 + i])

    return matrix.map((row) => row.map((cell) => Boolean(cell)))
}

interface QRCodeProps {
    value: string
    size?: number
    className?: string
    bgColor?: string
    fgColor?: string
}

export const QRCode: React.FC<QRCodeProps> = ({
    value,
    size = 200,
    className = '',
    bgColor = '#FFFFFF',
    fgColor = '#000000',
}) => {
    const matrix = React.useMemo(() => {
        try {
            return generateQrMatrix(value)
        } catch (err) {
            console.error('Failed to generate QR matrix:', err)
            return []
        }
    }, [value])

    if (!matrix || matrix.length === 0) {
        return (
            <div
                style={{ width: size, height: size }}
                className={`flex items-center justify-center bg-white rounded-xl ${className}`}
            >
                <span className="text-xs text-gray-400">QR unavailable</span>
            </div>
        )
    }

    const n = matrix.length
    const cellSize = 10
    const padding = 2
    const totalSize = (n + padding * 2) * cellSize

    // Build SVG path
    let path = ''
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if (matrix[r][c]) {
                const x = (c + padding) * cellSize
                const y = (r + padding) * cellSize
                path += `M${x},${y}h${cellSize}v${cellSize}h-${cellSize}z `
            }
        }
    }

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${totalSize} ${totalSize}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label={`QR Code for ${value}`}
        >
            <rect width={totalSize} height={totalSize} fill={bgColor} rx={cellSize * 1.5} />
            <path d={path} fill={fgColor} />
        </svg>
    )
}

export default QRCode

