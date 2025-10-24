# Claude Code — Initial Prompt

You are an expert full-stack engineer. Build **LocalNote**, a personal, local-first encrypted note-taker with a mini-kanban.

## Environment
- Chrome-only
- Single user, no authentication
- Local home-drive repo
- Git CLI (Bitbucket remote, system credentials)

## Stack
- Next.js 16 (App Router) + TypeScript
- TailwindCSS + shadcn/ui + Radix + Lucide icons
- Tiptap v3 WYSIWYG editor

## Crypto
- AES-GCM (WebCrypto)
- PBKDF2/Argon2 KDF
- Passphrase unlock only
- No plaintext persistence

## File Layout
```
repo/
  notes/YYYY/MM/DD/<slug>.md.enc
  assets/<noteId>/*.bin.enc
  kanban/board.json.enc
  config/config.json.enc
```

## Tasks
1. Scaffold Next.js app with Tailwind and shadcn/ui
2. Implement AES-GCM crypto module (`lib/crypto/aesgcm.ts`)
3. Build repo init/setup wizard (select path, set passphrase)
4. Create Tiptap v3 editor with markdown I/O
5. Add template loader (Daily TODO, Meeting Notes, Scratchpad, TIL)
6. Implement Kanban with drag & drop, WIP limits
7. Add Git CLI integration (`lib/git/cli.ts`)
8. Add lock/unlock flow
9. Build PWA shell and theme switcher
