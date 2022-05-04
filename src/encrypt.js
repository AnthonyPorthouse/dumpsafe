import {randomBytes, createCipheriv, createDecipheriv} from 'crypto'

const key = Buffer.from(process.env.DUMPSAFE_KEY, 'base64')

export function encryptFile(fileBuffer) {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', key, iv)
    const dataBuffer = cipher.update(fileBuffer)

    return Buffer.concat([iv, dataBuffer])
}

/**
 *
 * @param fileBuffer [Buffer]
 */
export function decryptFile(fileBuffer) {
    const iv = fileBuffer.subarray(0, 16)
    const data = fileBuffer.subarray(16)

    const cipher = createDecipheriv('aes-256-gcm', key, iv)
    return cipher.update(data)
}
