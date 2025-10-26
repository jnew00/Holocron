/**
 * SecureString wrapper to prevent accidental logging of sensitive data
 *
 * Usage:
 *   const passphrase = SecureString.create('my-secret');
 *   console.log(passphrase); // Logs: [SecureString:REDACTED]
 *   const value = passphrase.reveal(); // Only way to access value
 */

export class SecureString {
  private readonly value: string;
  private readonly type: 'passphrase' | 'sessionKey' | 'secret' | 'dek';

  private constructor(value: string, type: 'passphrase' | 'sessionKey' | 'secret' | 'dek' = 'secret') {
    this.value = value;
    this.type = type;
  }

  /**
   * Create a SecureString from a plain string
   */
  static create(value: string, type: 'passphrase' | 'sessionKey' | 'secret' | 'dek' = 'secret'): SecureString {
    if (!value || typeof value !== 'string') {
      throw new Error('SecureString value must be a non-empty string');
    }
    return new SecureString(value, type);
  }

  /**
   * Reveal the underlying value
   * Use sparingly and only when necessary for crypto operations
   */
  reveal(): string {
    return this.value;
  }

  /**
   * Get the length without revealing the value
   */
  get length(): number {
    return this.value.length;
  }

  /**
   * Check if empty
   */
  isEmpty(): boolean {
    return this.value.length === 0;
  }

  /**
   * Custom toString to prevent accidental logging
   */
  toString(): string {
    return `[SecureString:${this.type}:REDACTED]`;
  }

  /**
   * Custom toJSON to prevent accidental serialization
   */
  toJSON(): string {
    return `[SecureString:${this.type}:REDACTED]`;
  }

  /**
   * Custom inspect for Node.js console
   */
  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return `[SecureString:${this.type}:REDACTED]`;
  }

  /**
   * Clear the value (for cleanup)
   * Note: This doesn't actually zero memory in JavaScript,
   * but marks the intent to dispose
   */
  clear(): void {
    // In a language with manual memory management, we'd zero the memory here
    // In JS, we can only mark it for GC and hope for the best
    (this.value as any) = null;
  }
}

/**
 * Type guard to check if something is a SecureString
 */
export function isSecureString(value: any): value is SecureString {
  return value instanceof SecureString;
}

/**
 * Helper to safely extract value from SecureString | string
 */
export function revealSecureValue(value: SecureString | string | null | undefined): string | null {
  if (!value) return null;
  if (isSecureString(value)) return value.reveal();
  return value;
}
