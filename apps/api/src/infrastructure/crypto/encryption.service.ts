import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_BYTES = 16
const PREFIX = 'ENC:'

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY
  if (!raw) throw new Error('ENCRYPTION_KEY is not set — cannot encrypt/decrypt sensitive fields')
  if (raw.length !== 64) throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)')
  return Buffer.from(raw, 'hex')
}

/**
 * AES-256-GCM encrypt. Returns a self-contained string: ENC:<iv>:<authTag>:<ciphertext> (base64).
 * Each call uses a fresh random IV so identical plaintexts produce different ciphertexts.
 */
export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${PREFIX}${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`
}

/**
 * Decrypt a value produced by encrypt(). Throws if the auth tag doesn't match (tampered data).
 * Returns the original string unchanged if it doesn't have the ENC: prefix (plaintext legacy value).
 */
export function decrypt(value: string): string {
  if (!isEncrypted(value)) return value
  const inner = value.slice(PREFIX.length)
  const parts = inner.split(':')
  if (parts.length !== 3) throw new Error('Malformed encrypted value')
  const [ivB64, authTagB64, encryptedB64] = parts
  const key = getKey()
  const iv = Buffer.from(ivB64, 'base64')
  const authTag = Buffer.from(authTagB64, 'base64')
  const encrypted = Buffer.from(encryptedB64, 'base64')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}

/** Returns true only if the value was produced by encrypt(). Safe to call on any string. */
export function isEncrypted(value: string): boolean {
  return value.startsWith(PREFIX)
}

/** Encrypt if not already encrypted. Safe to call multiple times on the same value. */
export function encryptIfNeeded(value: string): string {
  return isEncrypted(value) ? value : encrypt(value)
}
