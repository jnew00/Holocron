/**
 * @jest-environment node
 */
import {
  encrypt,
  decrypt,
  encryptFile,
  decryptFile,
  validatePassphrase,
} from "../aesgcm";

describe("AES-GCM Encryption", () => {
  const testPassphrase = "my-secure-passphrase-123";
  const testData = "This is some secret data that needs encryption";

  describe("encrypt/decrypt text", () => {
    it("should encrypt and decrypt text successfully", async () => {
      const encrypted = await encrypt(testData, testPassphrase);
      const decrypted = await decrypt(encrypted, testPassphrase);

      expect(decrypted).toBe(testData);
    });

    it("should produce different ciphertext for same data (random IV/salt)", async () => {
      const encrypted1 = await encrypt(testData, testPassphrase);
      const encrypted2 = await encrypt(testData, testPassphrase);

      expect(encrypted1).not.toBe(encrypted2);

      // But both should decrypt to the same value
      const decrypted1 = await decrypt(encrypted1, testPassphrase);
      const decrypted2 = await decrypt(encrypted2, testPassphrase);

      expect(decrypted1).toBe(testData);
      expect(decrypted2).toBe(testData);
    });

    it("should fail to decrypt with wrong passphrase", async () => {
      const encrypted = await encrypt(testData, testPassphrase);

      await expect(
        decrypt(encrypted, "wrong-passphrase")
      ).rejects.toThrow("Decryption failed");
    });

    it("should fail to decrypt corrupted data", async () => {
      const encrypted = await encrypt(testData, testPassphrase);

      // Corrupt the encrypted data
      const corrupted = encrypted.slice(0, -10) + "corrupted!";

      await expect(
        decrypt(corrupted, testPassphrase)
      ).rejects.toThrow();
    });

    it("should handle empty string", async () => {
      const encrypted = await encrypt("", testPassphrase);
      const decrypted = await decrypt(encrypted, testPassphrase);

      expect(decrypted).toBe("");
    });

    it("should handle unicode characters", async () => {
      const unicodeData = "Hello 世界 🌍 émojis";
      const encrypted = await encrypt(unicodeData, testPassphrase);
      const decrypted = await decrypt(encrypted, testPassphrase);

      expect(decrypted).toBe(unicodeData);
    });

    it("should handle large text data", async () => {
      const largeData = "A".repeat(100000); // 100KB of text
      const encrypted = await encrypt(largeData, testPassphrase);
      const decrypted = await decrypt(encrypted, testPassphrase);

      expect(decrypted).toBe(largeData);
    });
  });

  describe("encryptFile/decryptFile binary data", () => {
    it("should encrypt and decrypt binary data successfully", async () => {
      // Create test binary data
      const testBuffer = new Uint8Array([0, 1, 2, 3, 4, 5, 255, 254, 253]);
      const encrypted = await encryptFile(testBuffer.buffer, testPassphrase);
      const decrypted = await decryptFile(encrypted, testPassphrase);

      const decryptedArray = new Uint8Array(decrypted);
      expect(decryptedArray).toEqual(testBuffer);
    });

    it("should fail to decrypt file with wrong passphrase", async () => {
      const testBuffer = new Uint8Array([1, 2, 3, 4, 5]);
      const encrypted = await encryptFile(testBuffer.buffer, testPassphrase);

      await expect(
        decryptFile(encrypted, "wrong-passphrase")
      ).rejects.toThrow("File decryption failed");
    });

    it("should handle empty file", async () => {
      const emptyBuffer = new Uint8Array([]);
      const encrypted = await encryptFile(emptyBuffer.buffer, testPassphrase);
      const decrypted = await decryptFile(encrypted, testPassphrase);

      expect(new Uint8Array(decrypted)).toEqual(emptyBuffer);
    });

    it("should handle large binary files", async () => {
      // Create a 1MB binary file
      const largeBuffer = new Uint8Array(1024 * 1024);
      for (let i = 0; i < largeBuffer.length; i++) {
        largeBuffer[i] = i % 256;
      }

      const encrypted = await encryptFile(largeBuffer.buffer, testPassphrase);
      const decrypted = await decryptFile(encrypted, testPassphrase);

      expect(new Uint8Array(decrypted)).toEqual(largeBuffer);
    });
  });

  describe("validatePassphrase", () => {
    it("should validate correct passphrase", async () => {
      const encrypted = await encrypt("test-validation", testPassphrase);
      const isValid = await validatePassphrase(encrypted, testPassphrase);

      expect(isValid).toBe(true);
    });

    it("should reject incorrect passphrase", async () => {
      const encrypted = await encrypt("test-validation", testPassphrase);
      const isValid = await validatePassphrase(encrypted, "wrong-passphrase");

      expect(isValid).toBe(false);
    });
  });

  describe("security properties", () => {
    it("should use different salt for each encryption", async () => {
      const encrypted1 = await encrypt(testData, testPassphrase);
      const encrypted2 = await encrypt(testData, testPassphrase);

      // Decode base64 and extract first 16 bytes (salt)
      const decoded1 = Uint8Array.from(atob(encrypted1), (c) => c.charCodeAt(0));
      const decoded2 = Uint8Array.from(atob(encrypted2), (c) => c.charCodeAt(0));

      const salt1 = decoded1.slice(0, 16);
      const salt2 = decoded2.slice(0, 16);

      expect(salt1).not.toEqual(salt2);
    });

    it("should use different IV for each encryption", async () => {
      const encrypted1 = await encrypt(testData, testPassphrase);
      const encrypted2 = await encrypt(testData, testPassphrase);

      // Decode base64 and extract bytes 16-28 (IV)
      const decoded1 = Uint8Array.from(atob(encrypted1), (c) => c.charCodeAt(0));
      const decoded2 = Uint8Array.from(atob(encrypted2), (c) => c.charCodeAt(0));

      const iv1 = decoded1.slice(16, 28);
      const iv2 = decoded2.slice(16, 28);

      expect(iv1).not.toEqual(iv2);
    });

    it("encrypted data should be longer than plaintext (salt + IV + ciphertext)", async () => {
      const encrypted = await encrypt(testData, testPassphrase);
      const decoded = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));

      // Should have at least: 16 (salt) + 12 (IV) + data length
      expect(decoded.length).toBeGreaterThan(testData.length + 28);
    });
  });
});
