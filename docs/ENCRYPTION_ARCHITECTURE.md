# Encryption Architecture (v2.0)

## Overview

Holocron uses a **Key Wrapping Architecture** (also known as the DEK/KEK pattern) to encrypt notes while keeping configuration and settings in plaintext. This is the same security model used by industry-standard password managers like 1Password and Bitwarden.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER UNLOCKS                            │
│                                                                 │
│  User Passphrase ──────────┐                                   │
│                            │                                    │
│                            ▼                                    │
│                    ┌──────────────┐                            │
│                    │   PBKDF2     │  (300k iterations)         │
│                    │   SHA-256    │                            │
│                    └──────┬───────┘                            │
│                           │                                     │
│                           ▼                                     │
│                    ┌──────────────┐                            │
│                    │     KEK      │  Key Encryption Key        │
│                    │  (ephemeral) │  (exists only in memory)   │
│                    └──────┬───────┘                            │
│                           │                                     │
│                           │ Unwraps                             │
│                           ▼                                     │
│   ┌─────────────────────────────────────────┐                 │
│   │  Wrapped DEK (from config.json)         │                 │
│   │  ├─ Salt (random, 16 bytes)             │                 │
│   │  ├─ Iterations (300,000)                │                 │
│   │  └─ Encrypted DEK (AES-256-GCM)         │                 │
│   └────────────────────┬────────────────────┘                 │
│                        │                                        │
│                        │ Decrypts to                            │
│                        ▼                                        │
│                 ┌──────────────┐                               │
│                 │     DEK      │  Data Encryption Key          │
│                 │  (256-bit)   │  (stored in memory)           │
│                 └──────┬───────┘                               │
└────────────────────────┼────────────────────────────────────────┘
                         │
                         │ Used for all file operations
                         ▼
         ┌───────────────────────────────────┐
         │   ENCRYPT/DECRYPT NOTES           │
         │                                   │
         │  note.md ──[DEK]──> note.md.enc  │
         │  note.md <─[DEK]─── note.md.enc  │
         └───────────────────────────────────┘
```

## Key Components

### 1. User Passphrase
- Entered by user during setup/unlock
- Never stored anywhere
- Only used to derive KEK

### 2. KEK (Key Encryption Key)
- Derived from user passphrase using PBKDF2-SHA256 (300k iterations)
- Exists only temporarily in memory during unlock
- Used only to unwrap the DEK
- Immediately discarded after unwrapping

### 3. DEK (Data Encryption Key)
- Random 256-bit key generated once during repository setup
- Encrypted (wrapped) with KEK and stored in config.json
- Decrypted (unwrapped) during unlock and kept in memory
- Used for all note encryption/decryption operations
- Stored as SecureString to prevent logging

### 4. Config File (config.json)
**Stored in plaintext** at `.holocron/config.json`

```json
{
  "version": "2.0",
  "encryption": {
    "salt": "base64-encoded-random-salt",
    "iterations": 300000,
    "wrappedDEK": "base64-encoded-encrypted-dek"
  },
  "settings": {
    "theme": "dark",
    "editorFont": "mono",
    ...
  },
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

## Security Properties

### What's Secret?
1. **User Passphrase** - Never stored, never logged
2. **DEK** - Encrypted at rest, stored as SecureString in memory
3. **Notes** - Encrypted with DEK using AES-256-GCM with AAD

### What's Public?
1. **Salt** - Random value, not secret (stored in plaintext)
2. **Iterations** - Public knowledge, not secret
3. **Wrapped DEK** - Encrypted DEK, useless without passphrase
4. **Settings** - UI preferences, not sensitive

### Why This Is Secure

Even if an attacker has access to the entire `.holocron` folder:
- They cannot decrypt notes without the user's passphrase
- The wrapped DEK is encrypted with a key derived from the passphrase (KEK)
- PBKDF2 with 300k iterations makes brute-forcing passphrases computationally expensive
- Each note has AAD (Additional Authenticated Data) binding it to its file path

## Performance Benefits

### Before (v1.0 - Passphrase-per-file)
```
For each file operation:
  Passphrase → PBKDF2 (300k iterations) → Key → Encrypt/Decrypt
  Time: ~300ms per file
```

### After (v2.0 - Key Wrapping)
```
Once at unlock:
  Passphrase → PBKDF2 (300k iterations) → KEK → Unwrap DEK
  Time: ~300ms (one time)

For each file operation:
  DEK → Encrypt/Decrypt
  Time: <5ms per file
```

**Performance improvement: 10-100x faster** ⚡

## Implementation Files

### Core Crypto
- `lib/crypto/unified.ts` - Encryption primitives, DEK generation, key wrapping
- `lib/schema/config.ts` - Config schema and validation

### Key Management
- `contexts/RepoContext.tsx` - DEK storage and retrieval
- `hooks/useWizardSetup.ts` - Repository setup and unlock flow
- `lib/security/SecureString.ts` - Prevents DEK from being logged

### Git Operations
- `app/api/git/commit/route.ts` - Encrypts notes before commit
- `app/api/git/pull/route.ts` - Decrypts notes after pull
- All operations use DEK instead of passphrase

### Config Operations
- `app/api/config/read/route.ts` - Reads plaintext config
- `app/api/config/write/route.ts` - Writes plaintext config

## Migration from v1.0

If you have an existing repository from v1.0 (with encrypted config), you'll see an error during unlock:

```
"This repository uses an old encrypted config format.
Please create a new repository or manually migrate by
deleting .holocron/config.json.enc and re-initializing."
```

**Migration steps:**
1. Back up your notes folder
2. Delete the `.holocron` folder
3. Re-initialize the repository with the setup wizard
4. Your notes will be re-encrypted with the new architecture

## API Changes

### Before (v1.0)
```typescript
// Passphrase required for every git operation
await commit(repoPath, {
  message: "Update notes",
  passphrase: passphrase
});
```

### After (v2.0)
```typescript
// DEK required for git operations (retrieved from context)
const dekBase64 = getDEK();
await commit(repoPath, {
  message: "Update notes",
  dekBase64: dekBase64
});
```

## Best Practices

### For Developers
1. Never log the DEK - use SecureString wrapper
2. Always use `getDEK()` from RepoContext, never store directly
3. Clear DEK from memory on lock (call `secureDEK.clear()`)
4. Use AAD for all note encryption (binds ciphertext to file path)

### For Users
1. Choose a strong passphrase (minimum 8 characters recommended)
2. Your passphrase is never stored - if you forget it, notes cannot be decrypted
3. The config.json can be committed to Git safely (it's plaintext metadata)
4. Notes are always encrypted as `.md.enc` files before Git commits

## Security Considerations

### Threat Model
**Protected against:**
- ✅ Theft of Git repository (notes are encrypted)
- ✅ Accidental commit of sensitive data (notes are .enc)
- ✅ Offline brute-force attacks (PBKDF2 with high iterations)
- ✅ File path substitution (AAD binding)

**NOT protected against:**
- ❌ Keyloggers (passphrase can be captured at entry)
- ❌ Memory dumps (DEK is in memory during use)
- ❌ Malicious JavaScript (web app has full access)
- ❌ Weak passphrases (no password strength enforcement)

### Design Philosophy
This is a **local-first, privacy-focused** note-taking app. The encryption is designed to protect your notes when:
- Synced to Git (notes are encrypted at rest)
- Stored on disk (notes are encrypted files)
- Shared across devices (config is portable)

It is **NOT** designed to protect against:
- Active attackers with root access
- Nation-state adversaries
- Compromised operating system

For maximum security, use:
- Strong, unique passphrase (20+ characters)
- Full-disk encryption (FileVault, BitLocker, LUKS)
- Trusted devices only

## References

- [NIST Special Publication 800-132](https://csrc.nist.gov/publications/detail/sp/800-132/final) - PBKDF2 recommendations
- [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode) - Authenticated encryption
- [Key Wrapping](https://en.wikipedia.org/wiki/Key_wrap) - Industry standard pattern
- [1Password Security Design](https://1passwordstatic.com/files/security/1password-white-paper.pdf) - Inspiration for this architecture
