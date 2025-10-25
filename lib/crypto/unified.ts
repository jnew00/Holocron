/**
 * Unified AES-GCM encryption/decryption module
 *
 * ISOMORPHIC: Works in both browser (WebCrypto) and Node.js (crypto.webcrypto)
 *
 * Security Properties:
 * - AES-256-GCM authenticated encryption
 * - PBKDF2-SHA256 key derivation (100,000 iterations)
 * - Unique random IV (96-bit) per encryption
 * - AAD (Additional Authenticated Data) for context binding
 * - Constant format: salt(16) + iv(12) + ciphertext (includes auth tag)
 *
 * @module lib/crypto/unified
 */

// Constants aligned with OWASP recommendations
const SALT_LENGTH = 16; // 128 bits
const IV_LENGTH = 12; // 96 bits (optimal for GCM)
const PBKDF2_ITERATIONS = 100000; // OWASP minimum
const KEY_LENGTH = 256; // AES-256

/**
 * Platform-agnostic crypto interface
 * Returns WebCrypto API (browser or Node.js)
 */
function getCrypto(): Crypto {
  // Check global crypto first (works in browser, Jest, and modern Node.js)
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto;
  }

  // Browser environment
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto;
  }

  // Node.js environment (16.x+) - try require
  try {
    const nodeCrypto = require('crypto');
    if (nodeCrypto.webcrypto) {
      return nodeCrypto.webcrypto as Crypto;
    }
  } catch {
    // Ignore import errors
  }

  throw new Error('WebCrypto API not available in this environment');
}

/**
 * Derives a cryptographic key from a passphrase using PBKDF2-SHA256
 *
 * @param passphrase - User passphrase
 * @param salt - Random salt (must be unique per encryption)
 * @returns CryptoKey for AES-GCM operations
 */
async function deriveKey(
  passphrase: string,
  salt: BufferSource
): Promise<CryptoKey> {
  const crypto = getCrypto();
  const encoder = new TextEncoder();

  // Import passphrase as raw key material
  const passphraseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive AES-256-GCM key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passphraseKey,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data using AES-256-GCM with AAD binding
 *
 * @param data - String or binary data to encrypt
 * @param passphrase - User passphrase for key derivation
 * @param aad - Additional Authenticated Data (e.g., file path) to bind ciphertext to context
 * @returns Encrypted data: salt(16) + iv(12) + ciphertext
 *
 * @example
 * const encrypted = await encrypt('secret data', 'mypassword', 'notes/2025/10/25/note.md');
 */
export async function encrypt(
  data: string | ArrayBuffer,
  passphrase: string,
  aad = ''
): Promise<Uint8Array> {
  const crypto = getCrypto();
  const encoder = new TextEncoder();

  // Generate random salt and IV (MUST be unique per encryption)
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Derive key from passphrase + salt
  const key = await deriveKey(passphrase, salt);

  // Convert data to Uint8Array
  const plaintext = typeof data === 'string'
    ? encoder.encode(data)
    : new Uint8Array(data);

  // Encrypt with AAD binding
  const additionalData = aad ? encoder.encode(aad) : undefined;
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      ...(additionalData && { additionalData }),
    },
    key,
    plaintext
  );

  // Combine: salt + iv + ciphertext (auth tag is included in ciphertext by GCM)
  const result = new Uint8Array(SALT_LENGTH + IV_LENGTH + ciphertext.byteLength);
  result.set(salt, 0);
  result.set(iv, SALT_LENGTH);
  result.set(new Uint8Array(ciphertext), SALT_LENGTH + IV_LENGTH);

  return result;
}

/**
 * Decrypts AES-256-GCM encrypted data with AAD verification
 *
 * @param encrypted - Encrypted data (salt + iv + ciphertext format)
 * @param passphrase - User passphrase for key derivation
 * @param aad - Additional Authenticated Data (must match encryption AAD)
 * @returns Decrypted data as ArrayBuffer
 * @throws CryptoError if decryption fails (wrong passphrase, corrupted data, or AAD mismatch)
 *
 * @example
 * const decrypted = await decrypt(encryptedData, 'mypassword', 'notes/2025/10/25/note.md');
 * const text = new TextDecoder().decode(decrypted);
 */
export async function decrypt(
  encrypted: Uint8Array,
  passphrase: string,
  aad = ''
): Promise<ArrayBuffer> {
  const crypto = getCrypto();
  const encoder = new TextEncoder();

  // Validate minimum size
  if (encrypted.length < SALT_LENGTH + IV_LENGTH) {
    throw new CryptoError('CorruptedData', 'Encrypted data too short');
  }

  // Extract components
  const salt = encrypted.slice(0, SALT_LENGTH);
  const iv = encrypted.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = encrypted.slice(SALT_LENGTH + IV_LENGTH);

  // Derive key from passphrase + salt
  const key = await deriveKey(passphrase, salt);

  // Decrypt with AAD verification
  try {
    const additionalData = aad ? encoder.encode(aad) : undefined;
    return await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        ...(additionalData && { additionalData }),
      },
      key,
      ciphertext
    );
  } catch (error) {
    // WebCrypto throws generic error, provide more context
    throw new CryptoError(
      'DecryptionFailed',
      'Invalid passphrase, corrupted data, or AAD mismatch'
    );
  }
}

/**
 * Encrypts string data and returns base64-encoded result
 * Convenience wrapper for text data
 */
export async function encryptString(
  data: string,
  passphrase: string,
  aad = ''
): Promise<string> {
  const encrypted = await encrypt(data, passphrase, aad);
  return base64Encode(encrypted);
}

/**
 * Decrypts base64-encoded data and returns string
 * Convenience wrapper for text data
 */
export async function decryptString(
  encryptedBase64: string,
  passphrase: string,
  aad = ''
): Promise<string> {
  const encrypted = base64Decode(encryptedBase64);
  const decrypted = await decrypt(encrypted, passphrase, aad);
  return new TextDecoder().decode(decrypted);
}

/**
 * Validates a passphrase by attempting to decrypt known encrypted data
 * Used during unlock flow
 */
export async function validatePassphrase(
  testEncryptedData: string,
  passphrase: string
): Promise<boolean> {
  try {
    await decryptString(testEncryptedData, passphrase);
    return true;
  } catch {
    return false;
  }
}

/**
 * Custom error class for crypto operations
 */
export class CryptoError extends Error {
  constructor(
    public readonly code: 'InvalidPassphrase' | 'CorruptedData' | 'DecryptionFailed',
    message: string
  ) {
    super(message);
    this.name = 'CryptoError';
  }
}

/**
 * Base64 encoding (browser + Node.js compatible)
 */
function base64Encode(data: Uint8Array): string {
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    // Browser - use chunking for large data to avoid stack overflow
    const CHUNK_SIZE = 8192;
    let result = '';
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      result += String.fromCharCode(...chunk);
    }
    return window.btoa(result);
  } else {
    // Node.js
    return Buffer.from(data).toString('base64');
  }
}

/**
 * Base64 decoding (browser + Node.js compatible)
 */
function base64Decode(encoded: string): Uint8Array {
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    // Browser
    return Uint8Array.from(window.atob(encoded), c => c.charCodeAt(0));
  } else {
    // Node.js
    return new Uint8Array(Buffer.from(encoded, 'base64'));
  }
}

/**
 * Encrypts config with a fixed salt for cross-device compatibility
 * Uses deterministic salt so the same passphrase produces decryptable config on any machine
 *
 * @param data - Config JSON string
 * @param passphrase - User passphrase
 * @returns Base64-encoded encrypted config
 */
export async function encryptConfig(
  data: string,
  passphrase: string
): Promise<string> {
  const crypto = getCrypto();
  const encoder = new TextEncoder();

  // Fixed salt for config (allows decryption on any machine with same passphrase)
  const fixedSaltString = 'localnote-config-salt-v1';
  const salt = encoder.encode(fixedSaltString).slice(0, SALT_LENGTH);

  // Pad to SALT_LENGTH if needed
  const paddedSalt = new Uint8Array(SALT_LENGTH);
  paddedSalt.set(salt);

  // Random IV (still unique per encryption)
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Derive key
  const key = await deriveKey(passphrase, paddedSalt);

  // Encrypt
  const plaintext = encoder.encode(data);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  );

  // Format: iv(12) + ciphertext (no salt needed since it's fixed)
  const result = new Uint8Array(IV_LENGTH + ciphertext.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(ciphertext), IV_LENGTH);

  return base64Encode(result);
}

/**
 * Decrypts config encrypted with encryptConfig
 *
 * @param encryptedBase64 - Base64-encoded encrypted config
 * @param passphrase - User passphrase
 * @returns Decrypted config JSON string
 */
export async function decryptConfig(
  encryptedBase64: string,
  passphrase: string
): Promise<string> {
  const crypto = getCrypto();
  const encoder = new TextEncoder();

  const encrypted = base64Decode(encryptedBase64);

  // Fixed salt (same as encryption)
  const fixedSaltString = 'localnote-config-salt-v1';
  const salt = encoder.encode(fixedSaltString).slice(0, SALT_LENGTH);
  const paddedSalt = new Uint8Array(SALT_LENGTH);
  paddedSalt.set(salt);

  // Extract IV and ciphertext
  const iv = encrypted.slice(0, IV_LENGTH);
  const ciphertext = encrypted.slice(IV_LENGTH);

  // Derive key
  const key = await deriveKey(passphrase, paddedSalt);

  // Decrypt
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    throw new CryptoError('DecryptionFailed', 'Invalid passphrase or corrupted config');
  }
}

/**
 * Re-export for backward compatibility during migration
 * These match the old API signatures
 */
export const encryptFile = encrypt;
export const decryptFile = decrypt;
