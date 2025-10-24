# LocalNote — Product Requirements Document (PRD)
**Date:** 2025-10-24  
**Author:** Jason Newberg  
**Version:** v1.0

---

## 1. Summary
LocalNote is a personal, local-first note-taking web app for corporate environments that prohibit SaaS tools. It features a rich WYSIWYG editor, markdown persistence, client-side encryption, and Git commit/push functionality. A simple Kanban board allows task tracking with WIP limits. The app runs locally on Chrome and persists data via encrypted markdown files stored in a home-drive Git repo.

---

## 2. Objectives
- Enable structured note-taking (daily notes, meetings, scratchpads, TILs)
- Offer a smooth, modern WYSIWYG experience
- Encrypt all content before persistence
- Allow offline use and seamless Git sync
- Provide a personal Kanban board with configurable columns and WIP limits

---

## 3. Key Features

### 3.1 Editor
- Built with **Tiptap v3**, using shadcn/ui components.
- Rich formatting: headings, lists, checkboxes, tables, callouts, code, links, images.
- Markdown import/export.
- Templates for note types (Daily TODO, Meeting Notes, Scratchpad, TIL).

### 3.2 Encryption
- AES-GCM (WebCrypto) with PBKDF2/Argon2 key derivation.
- Passphrase-based unlock; no external login.
- Plaintext never written to disk; decrypted in memory only.

### 3.3 Git Integration
- Uses **system Git CLI** (`git init`, `add`, `commit`, `push`, `pull`).
- Commits encrypted `.md.enc` files.
- Supports local home-drive repo and remote Bitbucket push.

### 3.4 Kanban Board
- Default columns: Backlog, Doing, Done.
- Add/edit custom columns, reorder, and set WIP limits.
- Drag & drop tasks, link notes, autosync checkboxes.

### 3.5 Search & Organization
- In-memory search over decrypted notes.
- Quick-switcher (Ctrl/Cmd + K).
- Tagging and YAML front-matter metadata.

---

## 4. Technical Architecture

### Stack
- **Next.js 16**, App Router
- **TypeScript + Tailwind**
- **shadcn/ui + Radix** for UI components
- **Lucide icons**
- **Tiptap v3** editor

### File Layout
```
repo/
  notes/YYYY/MM/DD/<slug>.md.enc
  assets/<noteId>/*.bin.enc
  kanban/board.json.enc
  config/config.json.enc
```

### Crypto Module (`lib/crypto/aesgcm.ts`)
- deriveKey(passphrase, salt)
- encryptFile(plaintext, meta)
- decryptFile(blob)
- lock/unlock key lifecycle

### Git Module (`lib/git/cli.ts`)
- ensureRepo()
- add/commit/push/pull/status
- Uses system git via child process

---

## 5. UX Requirements
- Chrome-only
- PWA shell for installable app
- Light/dark themes
- Minimal UI (Lucide icons, no emojis)

---

## 6. Milestones
| Milestone | Description | Est. Duration |
|------------|--------------|---------------|
| M1 | Core scaffold, crypto, repo init | 2 days |
| M2 | Editor & templates | 2–3 days |
| M3 | Kanban MVP | 2 days |
| M4 | Git push/pull, conflict surface | 2 days |
| M5 | Lock screen, polish | 1 day |

---

## 7. Acceptance Criteria
- All notes stored only as encrypted `.enc` files
- Decrypt successfully with passphrase on fresh machine
- Full WYSIWYG editing, templates working
- Kanban persistent and functional
- Git push to Bitbucket functional
