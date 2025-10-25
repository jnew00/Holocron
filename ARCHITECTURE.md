# LocalNote Architecture

## Overview
LocalNote is a local-first, encrypted note-taking application built with Next.js 16. This document describes the current architecture and design decisions.

## Core Principles

1. **Local-First**: All data stored on user's machine
2. **Encryption at Boundary**: Plaintext locally, encrypted in Git
3. **Seamless UX**: No repeated passphrase prompts
4. **Multi-Directory**: Support multiple note repositories with different passphrases

## Architecture Layers

### 1. Storage Layer

#### Local Storage (Plaintext)
```
/Users/You/MyNotes/
  notes/
    2024/10/24/
      meeting-notes.md          # ← Plaintext for fast editing
      project-ideas.md
  .localnote/
    config.json.enc             # ← Machine-encrypted config (safe to commit)
```

#### Git Storage (Encrypted)
```
Git Repository:
  notes/
    2024/10/24/
      meeting-notes.md.enc      # ← Encrypted with passphrase
      project-ideas.md.enc
  .localnote/
    config.json.enc             # ← Safe to commit (machine-specific encryption)
```

### 2. Encryption Model

#### Two-Layer Encryption

**Layer 1: Passphrase Encryption** (for Git)
- Algorithm: AES-256-GCM
- Input: Plaintext `.md` files
- Output: Encrypted `.md.enc` files
- When: During `git commit` and `git pull`
- Purpose: Secure notes in remote repository (Bitbucket)

**Layer 2: Machine Key Encryption** (for config)
- Algorithm: AES-256-GCM with PBKDF2 key derivation
- Input: Passphrase from user
- Output: Encrypted config file
- Key Derivation: `hostname + platform + architecture → PBKDF2 → 32-byte key`
- When: During setup and passphrase changes
- Purpose: Store passphrase securely, safe to commit to Git

#### Why Two Layers?

```
User Passphrase
    ↓
[Machine Key Encryption] → config.json.enc (in Git)
    ↓
Stored Passphrase
    ↓
[Passphrase Encryption] → notes/*.md.enc (in Git)
```

This enables:
- ✅ Config can be committed to Git safely
- ✅ Each machine decrypts config with its own key
- ✅ Multiple directories with different passphrases
- ✅ Seamless multi-machine sync

### 3. File Operations

#### Browser vs Server

**OLD (Complex):**
- Browser FileSystemDirectoryHandle API
- Sandboxed, can't access real paths
- Encrypted every file read/write
- Confusing dual-path system

**NEW (Simple):**
- Server-side Node.js file operations
- Full filesystem access
- Plaintext locally (fast)
- Encrypt only at Git boundary

#### API Routes

**Config Management:**
- `GET /api/config/read?repoPath=...` - Read encrypted config
- `POST /api/config/write` - Write encrypted config

**Note Operations:**
- `GET /api/notes/list?repoPath=...` - List all notes
- `GET /api/notes/read?repoPath=...&notePath=...` - Read note
- `POST /api/notes/write` - Write note
- `DELETE /api/notes/delete?repoPath=...&notePath=...` - Delete note

**Filesystem:**
- `GET /api/fs/select-directory` - Native OS folder picker
- `GET /api/fs/check-repo?path=...` - Check if valid LocalNote repo
- `POST /api/fs/init-repo` - Initialize new repository

**Git Operations:**
- `POST /api/git/commit` - Encrypt files, then commit
- `POST /api/git/pull` - Pull, then decrypt files
- `POST /api/git/push` - Push to remote
- `POST /api/git/status` - Get repository status
- `GET /api/git/config` - Get Git user config

### 4. User Flow

#### First-Time Setup
1. User clicks "Get Started"
2. Native OS folder picker opens
3. User selects directory (e.g., `/Users/You/MyNotes`)
4. User enters passphrase (min 8 chars)
5. System creates:
   - `.localnote/` directory
   - `notes/` directory
   - `config.json.enc` (encrypted with machine key)
6. User is auto-unlocked

#### Daily Use
1. User opens app
2. RepoContext auto-loads config from `.localnote/config.json.enc`
3. Decrypts passphrase using machine key
4. Auto-unlocks user
5. No passphrase prompt!

#### Git Workflow
1. User edits notes (plaintext `.md` files)
2. User clicks "Commit"
3. System:
   - Encrypts all `.md` → `.md.enc`
   - Stages encrypted files
   - Commits to Git
4. User clicks "Push" → encrypted files go to Bitbucket

#### New Machine Setup
1. Clone Git repo
2. Run LocalNote
3. Select cloned directory
4. Enter passphrase (first time only)
5. System:
   - Reads existing `config.json.enc`
   - Tries to decrypt with machine key (fails - different machine)
   - Validates entered passphrase against existing encrypted notes
   - Re-encrypts config with new machine key
   - Saves updated `config.json.enc`
6. Future sessions auto-unlock

### 5. Security Considerations

#### What's Protected?
- ✅ Notes in Git (encrypted with passphrase)
- ✅ Config in Git (encrypted with machine key)

#### What's Not Protected?
- ❌ Plaintext `.md` files on local disk
- ❌ Config file on local disk (anyone with filesystem access can decrypt)

#### Why This Is OK
- This is a **local app** running on your personal machine
- If attacker has filesystem access, they can read plaintext notes anyway
- Encryption protects notes in **remote Git repository** (Bitbucket)
- Multi-layer encryption prevents config from being useful on other machines

#### Threat Model
**Protected Against:**
- ✅ Unauthorized access to Git repository
- ✅ Notes visible in public/corporate Bitbucket
- ✅ Config leaking passphrase to other users

**NOT Protected Against:**
- ❌ Local filesystem access (but that's expected for a local app)
- ❌ Keyloggers or screen capture
- ❌ Physical access to unlocked machine

## File Structure

```
MyNotes/                          # User's selected directory
├── .localnote/
│   └── config.json.enc          # Encrypted config (safe to commit)
├── notes/
│   └── 2024/
│       └── 10/
│           └── 24/
│               ├── note.md      # Plaintext (gitignored)
│               └── note.md.enc  # Encrypted (tracked in Git)
├── assets/
│   └── [images, files]
├── kanban/
│   └── board.json
└── .gitignore                   # Ignore plaintext .md files
```

## Environment

- **Platform**: Next.js 16 (App Router)
- **Runtime**: Node.js (server-side APIs)
- **Deployment**: Local only (localhost:3000)
- **Browser**: Chrome (development), any modern browser (production)

## Future Considerations

### Potential Migration to Desktop App
Current architecture (Next.js web app) has limitations:
- Can't access filesystem paths directly from browser
- Requires server-side API routes for file operations

**Options:**
1. **Tauri** (Recommended) - Rust + Web, native filesystem access
2. **Electron** - Larger bundle, full Node.js access
3. **PWA** - Limited offline capabilities

If migrated to Tauri:
- Direct filesystem access from frontend
- No need for `/api/` routes
- Better file picker integration
- Smaller bundle size
- Native OS integration

### Database Migration
Current: Filesystem-based (markdown files)

Could migrate to:
- **SQLite** for better indexing and search
- **Local-first CRDB** (e.g., RxDB) for sync
- Keep markdown as export format

## FAQs

**Q: Why not encrypt files locally?**
A: Would require passphrase on every session, slow file operations, complex architecture. Current model: fast local editing, secure Git storage.

**Q: Is it safe to commit config.json.enc?**
A: Yes! It's encrypted with a machine-specific key. Each machine has a different encryption key based on hostname+platform+arch.

**Q: Can I use this with multiple computers?**
A: Yes! Clone the repo, enter passphrase once on new machine, system re-encrypts config for that machine.

**Q: What if I forget my passphrase?**
A: There's no recovery. The passphrase is needed to decrypt notes from Git. Keep it safe!

**Q: Why Next.js instead of Electron/Tauri?**
A: Started as web app for rapid development. May migrate to Tauri for better desktop integration.

## Contributors
- Built with Claude Code
- Architecture designed for local-first, encrypted note-taking
- Optimized for corporate environments where SaaS tools are blocked
