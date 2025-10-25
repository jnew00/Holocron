/**
 * Generate a machine-specific key for encrypting local config
 * This ensures config.json.enc can be committed to Git safely
 */

import * as crypto from "crypto";
import * as os from "os";

/**
 * Get a stable machine identifier
 * Uses hostname + platform + architecture for uniqueness
 */
export function getMachineId(): string {
  const hostname = os.hostname();
  const platform = os.platform();
  const arch = os.arch();

  // Combine to create a stable identifier for this machine
  return `${hostname}-${platform}-${arch}`;
}

/**
 * Derive a machine-specific encryption key
 * This is used to encrypt the passphrase in config.json.enc
 */
export function deriveMachineKey(): Buffer {
  const machineId = getMachineId();

  // Use a fixed salt specific to LocalNote
  const salt = Buffer.from("localnote-machine-key-v1", "utf-8");

  // Derive a 32-byte key using PBKDF2
  const key = crypto.pbkdf2Sync(machineId, salt, 100000, 32, "sha256");

  return key;
}

/**
 * Encrypt data using machine-specific key
 */
export function encryptWithMachineKey(plaintext: string): string {
  const key = deriveMachineKey();
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf-8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Format: iv(16) + authTag(16) + encrypted
  const result = Buffer.concat([iv, authTag, encrypted]);

  return result.toString("base64");
}

/**
 * Decrypt data using machine-specific key
 */
export function decryptWithMachineKey(ciphertext: string): string {
  const key = deriveMachineKey();
  const data = Buffer.from(ciphertext, "base64");

  // Extract components
  const iv = data.subarray(0, 16);
  const authTag = data.subarray(16, 32);
  const encrypted = data.subarray(32);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf-8");
}
