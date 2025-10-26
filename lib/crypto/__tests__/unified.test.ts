/**
 * Tests for unified crypto module
 * Verifies both correctness and security properties
 */

import {
  encrypt,
  decrypt,
  encryptString,
  decryptString,
  encryptConfig,
  decryptConfig,
  validatePassphrase,
  CryptoError,
} from '../unified';

describe('Unified Crypto Module', () => {
  const testPassphrase = 'test-passphrase-12345';
  const testData = 'Hello, World!';

  describe('Basic encrypt/decrypt', () => {
    it('should encrypt and decrypt string data', async () => {
      const encrypted = await encryptString(testData, testPassphrase);
      const decrypted = await decryptString(encrypted, testPassphrase);

      expect(decrypted).toBe(testData);
    });

    it('should encrypt and decrypt binary data', async () => {
      const binaryData = new TextEncoder().encode(testData);
      const encrypted = await encrypt(binaryData.buffer as ArrayBuffer, testPassphrase);
      const decrypted = await decrypt(encrypted, testPassphrase);

      const decryptedText = new TextDecoder().decode(decrypted);
      expect(decryptedText).toBe(testData);
    });

    it('should handle unicode characters', async () => {
      const unicode = '你好世界 🌍 Привет мир';
      const encrypted = await encryptString(unicode, testPassphrase);
      const decrypted = await decryptString(encrypted, testPassphrase);

      expect(decrypted).toBe(unicode);
    });

    it('should handle large data (1MB)', async () => {
      const largeData = 'x'.repeat(1024 * 1024); // 1MB
      const encrypted = await encryptString(largeData, testPassphrase);
      const decrypted = await decryptString(encrypted, testPassphrase);

      expect(decrypted).toBe(largeData);
    }, 10000); // 10s timeout
  });

  describe('Security: Wrong passphrase', () => {
    it('should fail to decrypt with wrong passphrase', async () => {
      const encrypted = await encryptString(testData, testPassphrase);

      await expect(
        decryptString(encrypted, 'wrong-passphrase')
      ).rejects.toThrow(CryptoError);
    });

    it('should throw CryptoError with correct code', async () => {
      const encrypted = await encryptString(testData, testPassphrase);

      try {
        await decryptString(encrypted, 'wrong-passphrase');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(CryptoError);
        expect((error as CryptoError).code).toBe('DecryptionFailed');
      }
    });
  });

  describe('Security: IV uniqueness', () => {
    it('should generate unique IVs across 100 encryptions', async () => {
      const ivs = new Set<string>();
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const encrypted = await encrypt(testData, testPassphrase);

        // Extract IV (bytes 16-28: after salt, before ciphertext)
        const iv = encrypted.slice(16, 28);
        const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');

        ivs.add(ivHex);
      }

      // All IVs should be unique (probability of collision is ~2^-96 per pair)
      expect(ivs.size).toBe(iterations);
    });

    it('should generate unique salts across 100 encryptions', async () => {
      const salts = new Set<string>();
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const encrypted = await encrypt(testData, testPassphrase);

        // Extract salt (first 16 bytes)
        const salt = encrypted.slice(0, 16);
        const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

        salts.add(saltHex);
      }

      // All salts should be unique
      expect(salts.size).toBe(iterations);
    });
  });

  describe('Security: AAD binding', () => {
    it('should encrypt and decrypt with matching AAD', async () => {
      const aad = 'notes/2025/10/25/test.md';
      const encrypted = await encrypt(testData, testPassphrase, aad);
      const decrypted = await decrypt(encrypted, testPassphrase, aad);

      const decryptedText = new TextDecoder().decode(decrypted);
      expect(decryptedText).toBe(testData);
    });

    it('should fail to decrypt with different AAD', async () => {
      const aad1 = 'notes/2025/10/25/test.md';
      const aad2 = 'notes/2025/10/25/other.md';

      const encrypted = await encrypt(testData, testPassphrase, aad1);

      await expect(
        decrypt(encrypted, testPassphrase, aad2)
      ).rejects.toThrow(CryptoError);
    });

    it('should fail if AAD provided during decrypt but not encrypt', async () => {
      const encrypted = await encrypt(testData, testPassphrase); // No AAD

      await expect(
        decrypt(encrypted, testPassphrase, 'notes/test.md') // With AAD
      ).rejects.toThrow(CryptoError);
    });

    it('should fail if AAD provided during encrypt but not decrypt', async () => {
      const encrypted = await encrypt(testData, testPassphrase, 'notes/test.md'); // With AAD

      await expect(
        decrypt(encrypted, testPassphrase) // No AAD
      ).rejects.toThrow(CryptoError);
    });
  });

  describe('Security: Tamper detection', () => {
    it('should detect corrupted ciphertext (modified byte)', async () => {
      const encrypted = await encrypt(testData, testPassphrase);

      // Corrupt one byte in the ciphertext (after salt + IV)
      const corrupted = new Uint8Array(encrypted);
      corrupted[30] ^= 0xFF; // Flip bits in ciphertext

      await expect(
        decrypt(corrupted, testPassphrase)
      ).rejects.toThrow(CryptoError);
    });

    it('should detect truncated ciphertext', async () => {
      const encrypted = await encrypt(testData, testPassphrase);

      // Truncate last 10 bytes
      const truncated = encrypted.slice(0, -10);

      await expect(
        decrypt(truncated, testPassphrase)
      ).rejects.toThrow(CryptoError);
    });

    it('should detect corrupted salt', async () => {
      const encrypted = await encrypt(testData, testPassphrase);

      // Corrupt salt (first byte)
      const corrupted = new Uint8Array(encrypted);
      corrupted[0] ^= 0xFF;

      await expect(
        decrypt(corrupted, testPassphrase)
      ).rejects.toThrow(CryptoError);
    });

    it('should detect corrupted IV', async () => {
      const encrypted = await encrypt(testData, testPassphrase);

      // Corrupt IV (byte 17)
      const corrupted = new Uint8Array(encrypted);
      corrupted[17] ^= 0xFF;

      await expect(
        decrypt(corrupted, testPassphrase)
      ).rejects.toThrow(CryptoError);
    });

    it('should reject data that is too short', async () => {
      const tooShort = new Uint8Array(20); // Less than salt + IV

      await expect(
        decrypt(tooShort, testPassphrase)
      ).rejects.toThrow(CryptoError);

      try {
        await decrypt(tooShort, testPassphrase);
      } catch (error) {
        expect((error as CryptoError).code).toBe('CorruptedData');
      }
    });
  });

  describe('Config encryption (fixed salt)', () => {
    const configData = JSON.stringify({ version: '1.0', passphrase: 'secret' }, null, 2);

    it('should encrypt and decrypt config', async () => {
      const encrypted = await encryptConfig(configData, testPassphrase);
      const decrypted = await decryptConfig(encrypted, testPassphrase);

      expect(decrypted).toBe(configData);
    });

    it('should produce same-length ciphertext for same data (due to fixed salt)', async () => {
      const encrypted1 = await encryptConfig(configData, testPassphrase);
      const encrypted2 = await encryptConfig(configData, testPassphrase);

      // Should be same length (fixed salt)
      expect(encrypted1.length).toBe(encrypted2.length);
    });

    it('should fail with wrong passphrase', async () => {
      const encrypted = await encryptConfig(configData, testPassphrase);

      await expect(
        decryptConfig(encrypted, 'wrong-passphrase')
      ).rejects.toThrow(CryptoError);
    });

    it('should have unique IVs even with fixed salt', async () => {
      const encrypted1 = await encryptConfig(configData, testPassphrase);
      const encrypted2 = await encryptConfig(configData, testPassphrase);

      // Ciphertexts should be different (different IVs)
      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('Passphrase validation', () => {
    it('should validate correct passphrase', async () => {
      const testEncrypted = await encryptString('test', testPassphrase);
      const isValid = await validatePassphrase(testEncrypted, testPassphrase);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect passphrase', async () => {
      const testEncrypted = await encryptString('test', testPassphrase);
      const isValid = await validatePassphrase(testEncrypted, 'wrong');

      expect(isValid).toBe(false);
    });
  });

  describe('Round-trip compatibility', () => {
    it('should work across multiple encrypt/decrypt cycles', async () => {
      let data = testData;

      // Encrypt and decrypt 10 times
      for (let i = 0; i < 10; i++) {
        const encrypted = await encryptString(data, testPassphrase);
        data = await decryptString(encrypted, testPassphrase);
      }

      expect(data).toBe(testData);
    });

    it('should handle empty string', async () => {
      const empty = '';
      const encrypted = await encryptString(empty, testPassphrase);
      const decrypted = await decryptString(encrypted, testPassphrase);

      expect(decrypted).toBe(empty);
    });

    it('should handle very long passphrase (1000 chars)', async () => {
      const longPass = 'x'.repeat(1000);
      const encrypted = await encryptString(testData, longPass);
      const decrypted = await decryptString(encrypted, longPass);

      expect(decrypted).toBe(testData);
    });
  });
});
