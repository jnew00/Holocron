/**
 * AES-GCM encryption/decryption module using WebCrypto API
 *
 * Implements:
 * - AES-GCM 256-bit encryption
 * - PBKDF2 key derivation (configurable to Argon2 in future)
 * - No plaintext persistence
 */

const SALT_LENGTH = 16; // 128 bits
const IV_LENGTH = 12; // 96 bits (recommended for GCM)
const PBKDF2_ITERATIONS = 100000; // OWASP recommended minimum
const KEY_LENGTH = 256; // AES-256

/**
 * Derives a cryptographic key from a passphrase using PBKDF2
 */
async function deriveKey(
  passphrase: string,
  salt: BufferSource
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    passphraseKey,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts data using AES-GCM
 *
 * @param data - String data to encrypt
 * @param passphrase - User passphrase for encryption
 * @returns Base64-encoded encrypted data with salt and IV prepended
 */
export async function encrypt(
  data: string,
  passphrase: string
): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Derive key from passphrase
  const key = await deriveKey(passphrase, salt);

  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    dataBuffer
  );

  // Combine salt + IV + encrypted data
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const combined = new Uint8Array(
    SALT_LENGTH + IV_LENGTH + encryptedArray.length
  );
  combined.set(salt, 0);
  combined.set(iv, SALT_LENGTH);
  combined.set(encryptedArray, SALT_LENGTH + IV_LENGTH);

  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts AES-GCM encrypted data
 *
 * @param encryptedData - Base64-encoded encrypted data with salt and IV
 * @param passphrase - User passphrase for decryption
 * @returns Decrypted string data
 * @throws Error if decryption fails (wrong passphrase or corrupted data)
 */
export async function decrypt(
  encryptedData: string,
  passphrase: string
): Promise<string> {
  try {
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedData), (c) =>
      c.charCodeAt(0)
    );

    // Extract salt, IV, and encrypted data
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH);

    // Derive key from passphrase
    const key = await deriveKey(passphrase, salt);

    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encrypted
    );

    // Convert to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    throw new Error("Decryption failed: invalid passphrase or corrupted data");
  }
}

/**
 * Encrypts a file (binary data) using AES-GCM
 *
 * @param fileData - ArrayBuffer of file data
 * @param passphrase - User passphrase for encryption
 * @returns Encrypted data as Uint8Array with salt and IV prepended
 */
export async function encryptFile(
  fileData: ArrayBuffer,
  passphrase: string
): Promise<Uint8Array> {
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Derive key from passphrase
  const key = await deriveKey(passphrase, salt);

  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    fileData
  );

  // Combine salt + IV + encrypted data
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const combined = new Uint8Array(
    SALT_LENGTH + IV_LENGTH + encryptedArray.length
  );
  combined.set(salt, 0);
  combined.set(iv, SALT_LENGTH);
  combined.set(encryptedArray, SALT_LENGTH + IV_LENGTH);

  return combined;
}

/**
 * Decrypts a file (binary data) using AES-GCM
 *
 * @param encryptedData - Encrypted file data with salt and IV
 * @param passphrase - User passphrase for decryption
 * @returns Decrypted file data as ArrayBuffer
 * @throws Error if decryption fails
 */
export async function decryptFile(
  encryptedData: Uint8Array,
  passphrase: string
): Promise<ArrayBuffer> {
  try {
    // Extract salt, IV, and encrypted data
    const salt = encryptedData.slice(0, SALT_LENGTH);
    const iv = encryptedData.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const encrypted = encryptedData.slice(SALT_LENGTH + IV_LENGTH);

    // Derive key from passphrase
    const key = await deriveKey(passphrase, salt);

    // Decrypt the data
    return await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encrypted
    );
  } catch (error) {
    throw new Error("File decryption failed: invalid passphrase or corrupted data");
  }
}

/**
 * Validates a passphrase by attempting to decrypt a known value
 * Used during unlock flow
 */
export async function validatePassphrase(
  testEncryptedData: string,
  passphrase: string
): Promise<boolean> {
  try {
    await decrypt(testEncryptedData, passphrase);
    return true;
  } catch {
    return false;
  }
}
