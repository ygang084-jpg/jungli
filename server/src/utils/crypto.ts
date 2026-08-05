import crypto from 'crypto'
import { env } from '../config/env'

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  const key = Buffer.from(env.encryptionKey, 'base64')
  if (key.length !== 32) {
    throw new Error(
      'ENCRYPTION_KEY는 base64로 인코딩된 32바이트 키여야 합니다. server/.env를 확인하세요.',
    )
  }
  return key
}

// 저장 형식: base64(iv).base64(authTag).base64(ciphertext)
export function encrypt(plainText: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return [iv, authTag, encrypted].map((buf) => buf.toString('base64')).join('.')
}

export function decrypt(payload: string): string {
  const [ivB64, authTagB64, dataB64] = payload.split('.')
  if (!ivB64 || !authTagB64 || !dataB64) {
    throw new Error('암호화된 값의 형식이 올바르지 않습니다.')
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(authTagB64, 'base64'))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}
