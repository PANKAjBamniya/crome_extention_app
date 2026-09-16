import { useCallback } from 'react'

export interface EncryptedData {
    ciphertext: string
    iv: string
    salt: string
}

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

const bufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer)

    let binary = ''

    for (const byte of bytes) {
        binary += String.fromCharCode(byte)
    }

    return btoa(binary)
}

const base64ToBuffer = (base64: string): ArrayBuffer => {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }

    return bytes.buffer as ArrayBuffer
}

const useEncryption = () => {

    const deriveKey = useCallback(
        async (
            password: string,
            salt: ArrayBuffer
        ): Promise<CryptoKey> => {

            const passwordKey =
                await crypto.subtle.importKey(
                    'raw',
                    textEncoder.encode(password),
                    {
                        name: 'PBKDF2',
                    },
                    false,
                    ['deriveKey']
                )

            return crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: new Uint8Array(salt),
                    iterations: 310000,
                    hash: 'SHA-256',
                },
                passwordKey,
                {
                    name: 'AES-GCM',
                    length: 256,
                },
                false,
                ['encrypt', 'decrypt']
            )
        },
        []
    )

    const encrypt = useCallback(
        async (
            data: string,
            password: string
        ): Promise<EncryptedData> => {

            if (!data) {
                throw new Error('No data provided')
            }

            if (!password) {
                throw new Error('No password provided')
            }

            const saltArray = crypto.getRandomValues(
                new Uint8Array(16)
            )

            const ivArray = crypto.getRandomValues(
                new Uint8Array(12)
            )

            const salt = saltArray.buffer as ArrayBuffer
            const iv = ivArray.buffer as ArrayBuffer

            const key = await deriveKey(
                password,
                salt
            )

            const encrypted =
                await crypto.subtle.encrypt(
                    {
                        name: 'AES-GCM',
                        iv: ivArray,
                    },
                    key,
                    textEncoder.encode(data)
                )

            return {
                ciphertext: bufferToBase64(encrypted),
                iv: bufferToBase64(iv),
                salt: bufferToBase64(salt),
            }
        },
        [deriveKey]
    )

    const decrypt = useCallback(
        async (
            encryptedData: EncryptedData,
            password: string
        ): Promise<string> => {

            const salt = base64ToBuffer(
                encryptedData.salt
            )

            const iv = base64ToBuffer(
                encryptedData.iv
            )

            const ciphertext = base64ToBuffer(
                encryptedData.ciphertext
            )

            const key = await deriveKey(
                password,
                salt
            )

            const decrypted =
                await crypto.subtle.decrypt(
                    {
                        name: 'AES-GCM',
                        iv: new Uint8Array(iv),
                    },
                    key,
                    ciphertext
                )

            return textDecoder.decode(decrypted)
        },
        [deriveKey]
    )

    return {
        encrypt,
        decrypt,
    }
}

export default useEncryption