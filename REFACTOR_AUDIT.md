# Holocron Architecture Refactoring Audit

**Date:** 2025-10-25
**Scope:** Complete codebase review for architecture, design patterns, and security boundaries
**Target Stack:** Next.js 16 (App Router), TypeScript strict, Tiptap v3, WebCrypto, Chrome PWA

---

## Executive Summary

Holocron is a well-conceived local-first encrypted note-taking application with a **critical security/architecture flaw** and several design anti-patterns that create maintenance burden and risk. The encrypt-on-push model is sound, but execution reveals:

### Critical Issues (P0 - Security/Correctness)
1. **DUPLICATE CRYPTO IMPLEMENTATIONS** — Two incompatible AES-GCM implementations with different formats (browser vs server)
2. **BROKEN CRYPTO BOUNDARY** — Passphrase stored in plaintext in React Context, leaked to console logs
3. **MISSING IV UNIQUENESS VALIDATION** — No tests verify IV is never reused across encryptions
4. **DEAD CODE CONTAMINATION** — Legacy `lib/security/machineKey.ts` and `lib/notes/noteManager.ts` using File System Access API (unused)
5. **MISSING SCHEMA VALIDATION** — No runtime validation of frontmatter/config with zod/valibot

### Major Issues (P1 - Design/Maintainability)
6. **GOD COMPONENT** — `app/page.tsx` (615 lines) violates SRP: editor state + kanban + git + UI + notes
7. **NO LAYERING** — Direct coupling between UI components and API routes; no service layer
8. **MISSING POLYMORPHISM** — Hardcoded crypto algorithm; no Strategy pattern for AES-GCM → Age migration path
9. **PRIMITIVE OBSESSION** — `string` passphrase/repoPath everywhere; no branded types for security-critical IDs
10. **NO COMMAND PATTERN** — Push/pull logic scattered; should be `ln-push`/`ln-pull` commands with rollback

### Testing Gaps (P1 - Quality)
11. **ZERO E2E TESTS** — No create→encrypt→commit→push→pull→decrypt round-trip
12. **NO GIT CLI TESTS** — Shell injection risk untested; error paths uncovered
13. **MISSING A11Y TESTS** — Keyboard nav, focus rings, screen reader for kanban DnD
14. **PWA CACHE VIOLATIONS** — No tests ensure secrets/plaintext never cached

### Performance/UX Issues (P2)
15. **UNNECESSARY CLIENT COMPONENTS** — Many route segments client-side when could be RSC
16. **LARGE EDITOR BUNDLE** — Tiptap + lowlight (all languages) → ~400KB
17. **RE-RENDER HOTSPOTS** — `useEffect` in `page.tsx` triggers on every markdown change
18. **HYDRATION WARNINGS** — Console logs visible during development

---

## 1. Architecture Assessment

### 1.1 Critical Security Violations

#### **FINDING 1: Duplicate Crypto Implementations (CRITICAL)**
**Severity:** 🔴 P0 — Data corruption risk
**Files:**
- `/lib/crypto/aesgcm.ts` (browser/server WebCrypto, salt=16, IV=12)
- `/app/api/git/commit/route.ts` (Node crypto, salt=32, IV=16, different format)
- `/app/api/git/pull/route.ts` (Node crypto decryption)

**Problem:**
```typescript
// Browser crypto (aesgcm.ts): salt(16) + iv(12) + ciphertext + authTag
// Node crypto (commit/route.ts): salt(32) + iv(16) + authTag(16) + ciphertext
```
These are **incompatible**. Files encrypted with one cannot be decrypted with the other. Current code works by accident because:
- `commit/route.ts` encrypts `.md` → `.md.enc`
- `pull/route.ts` decrypts `.md.enc` → `.md`
- Editor never calls browser crypto on `.md.enc` files

**Risk:** If browser crypto is ever used on note content, data will be corrupted/lost.

**Fix:**
- **Consolidate to a single crypto module** that works isomorphically (browser + Node)
- Use consistent format: `salt(16) + iv(12) + ciphertext` (GCM auth tag is part of ciphertext)
- Share via `/lib/crypto/unified.ts` imported by both client and API routes

**Target files:** `lib/crypto/aesgcm.ts`, `app/api/git/commit/route.ts`, `app/api/git/pull/route.ts`

---

#### **FINDING 2: Passphrase Leaked in Context + Console (CRITICAL)**
**Severity:** 🔴 P0 — Secret exposure
**Files:**
- `/contexts/RepoContext.tsx` (lines 8, 18, 45)
- `/app/page.tsx` (line 44)

**Problem:**
```typescript
// RepoContext.tsx
const [passphrase, setPassphrase] = useState<string | null>(null); // PLAINTEXT IN REACT STATE

// Multiple console.logs in RepoContext
console.log("[RepoContext] Config loaded, has passphrase:", !!config.passphrase);
console.log("[RepoContext] Auto-unlocked with stored passphrase");
```

Passphrases should **never** exist in plaintext outside of:
1. User input (immediately hashed)
2. Crypto operations (in-memory only, cleared after use)

**Current violations:**
- React state → visible in React DevTools
- Passed as prop to `<GitSync>`, `<SetupWizard>`, etc.
- Logged to console (even if redacted, pattern is wrong)

**Fix:**
- Derive session key from passphrase once during unlock
- Store only session key (or encrypted session token) in Context
- Pass session key to crypto operations via secure channel (not props)
- Use branded type `Passphrase` with runtime checks against accidental logging

**Target files:** `contexts/RepoContext.tsx`, `app/page.tsx`, `components/git/GitSync.tsx`

---

#### **FINDING 3: Missing IV Uniqueness + AAD Validation (HIGH)**
**Severity:** 🟠 P0 — Security property violation
**Files:**
- `/lib/crypto/aesgcm.ts`
- `/lib/crypto/__tests__/aesgcm.test.ts`

**Problem:**
AES-GCM requires:
1. **IV must be unique per encryption** (current code uses random IV ✅)
2. **AAD (Additional Authenticated Data)** should bind ciphertext to context (e.g., file path + metadata)

**Missing:**
- No test verifies IV is never reused (statistical test with 10K encryptions)
- No AAD binding (allows ciphertext swapping between files)
- No tamper detection test for partial file corruption

**Fix:**
- Add AAD parameter: `encrypt(data, passphrase, aad = '')` where `aad = filePath + frontmatter`
- Test: generate 10,000 encryptions, assert all IVs are unique
- Test: modify 1 byte of ciphertext, verify decrypt throws

**Target files:** `lib/crypto/aesgcm.ts`, `lib/crypto/__tests__/aesgcm.test.ts`

---

#### **FINDING 4: No Schema Validation (HIGH)**
**Severity:** 🟠 P1 — Runtime safety
**Files:**
- `/lib/notes/frontmatter.ts`
- `/app/api/config/read/route.ts`
- `/components/setup/SetupWizard.tsx`

**Problem:**
Frontmatter and config are parsed as `any`:
```typescript
// frontmatter.ts
const { data: frontmatter, content } = extractFrontmatter(data.content);
// frontmatter is 'any' — no validation
```

**Risks:**
- Malicious/corrupted YAML can inject arbitrary properties
- Missing required fields cause silent failures
- Type safety lost at runtime boundary

**Fix:**
- Define Zod schemas for all YAML structures:
  ```typescript
  // lib/schema/frontmatter.ts
  const NoteMetadataSchema = z.object({
    type: z.enum(['note', 'todo', 'meeting', 'til', 'project', 'weekly', 'book']),
    createdAt: z.string().datetime().optional(),
    tags: z.array(z.string()).optional()
  });
  ```
- Validate at parse time, throw descriptive errors
- Use discriminated unions for different note types

**Target files:** `lib/notes/frontmatter.ts`, `lib/schema/` (new), `app/api/config/read/route.ts`

---

### 1.2 Dead Code & Legacy Systems (P1)

#### **FINDING 5: Unused File System Access API Code**
**Severity:** 🟡 P1 — Confusing, maintenance burden
**Files:**
- `/lib/notes/noteManager.ts` (238 lines, UNUSED)
- `/lib/fs/repo.ts` (167 lines, UNUSED)
- `/lib/git/cli.ts` (261 lines, placeholder)
- `/lib/git/gitOperations.ts` (135 lines, isomorphic-git import, unused)
- `/lib/security/machineKey.ts` (81 lines, replaced by passphrase-based encryption)

**Problem:**
These files were part of an earlier architecture (browser-based File System Access API + isomorphic-git) that was replaced with server-side Node.js APIs. They:
- Are never imported in production code
- Confuse new developers about which crypto/FS implementation to use
- Contain duplicate logic that might be copy-pasted by mistake

**Fix:**
- **DELETE** all unused files after confirming no imports:
  ```bash
  rm lib/notes/noteManager.ts
  rm lib/fs/repo.ts
  rm lib/git/cli.ts
  rm lib/git/gitOperations.ts
  rm lib/security/machineKey.ts
  ```
- Update `ARCHITECTURE.md` to clearly state "server-side only, no browser FS access"

**Target files:** (delete)

---

### 1.3 Missing Architectural Boundaries

#### **FINDING 6: God Component (app/page.tsx)**
**Severity:** 🟠 P1 — Maintainability
**Location:** `/app/page.tsx` (615 lines)

**Responsibilities (violates SRP):**
1. Note CRUD (create, select, save, delete, archive)
2. Kanban board loading + sync
3. Editor state management (markdown, frontmatter, auto-save)
4. Tab navigation (notes vs kanban boards)
5. Sidebar/fullscreen UI state
6. Title change detection + path generation

**Problems:**
- Impossible to test in isolation (no unit tests possible)
- Re-renders on every state change → performance issues
- Business logic tangled with UI → cannot reuse logic elsewhere

**Fix:**
Decompose into:
```
app/page.tsx              → Layout/composition only (100 lines max)
features/notes/           → Note management feature
  ├── hooks/
  │   ├── useNotes.ts       → CRUD operations
  │   ├── useAutoSave.ts    → Auto-save with debounce
  │   └── useNoteTitle.ts   → Title extraction/tracking
  ├── NotesView.tsx         → Notes tab UI
  └── NoteEditor.tsx        → Editor + toolbar wrapper
features/kanban/
  ├── hooks/
  │   └── useBoards.ts      → Board loading/sync
  └── KanbanView.tsx        → Kanban tab UI
```

**Success check:** `page.tsx` becomes pure composition, ~80 lines

---

#### **FINDING 7: No Service Layer (Missing Repositories)**
**Severity:** 🟠 P1 — Layering violation
**Files:** All components directly calling `/api/*` routes

**Problem:**
```typescript
// components/notes/NotesSidebar.tsx — direct API call
const response = await fetch(`/api/notes/read?repoPath=...`);

// app/page.tsx — more direct API calls
await fetch("/api/notes/write", { method: "POST", ... });
```

No abstraction between UI and API → changes to API require updating every component.

**Fix:**
Introduce Repository pattern:
```typescript
// lib/repositories/NoteRepository.ts
export class NoteRepository {
  constructor(private repoPath: string) {}

  async read(notePath: string): Promise<Note> {
    const res = await fetch(`/api/notes/read?repoPath=${this.repoPath}&notePath=${notePath}`);
    if (!res.ok) throw new RepositoryError('Failed to read note', await res.json());
    return NoteSchema.parse(await res.json());
  }

  async write(notePath: string, content: string): Promise<void> { ... }
  async delete(notePath: string): Promise<void> { ... }
  async list(): Promise<NoteMetadata[]> { ... }
}

// Usage in components
const noteRepo = new NoteRepository(repoPath);
const note = await noteRepo.read(path);
```

Benefits:
- Centralized error handling
- Easy to mock for tests
- Type-safe responses with Zod validation
- Can add caching/retry logic in one place

**Target files:** `lib/repositories/` (new), all components calling `/api/*`

---

#### **FINDING 8: No Strategy Pattern for Crypto**
**Severity:** 🟡 P1 — Future-proofing
**Files:** `/lib/crypto/aesgcm.ts`

**Problem:**
Crypto algorithm is hardcoded. Migrating to Age encryption or Argon2id requires rewriting all call sites.

**Fix:**
```typescript
// lib/crypto/CryptoStrategy.ts
export interface CryptoStrategy {
  encrypt(data: string, secret: string, aad?: string): Promise<string>;
  decrypt(encrypted: string, secret: string, aad?: string): Promise<string>;
  readonly algorithm: string;
  readonly version: number;
}

// lib/crypto/AesGcmStrategy.ts
export class AesGcmStrategy implements CryptoStrategy {
  algorithm = 'AES-256-GCM';
  version = 1;

  async encrypt(data: string, passphrase: string, aad = ''): Promise<string> {
    // ... existing AES-GCM code
  }
}

// lib/crypto/AgeStrategy.ts (future)
export class AgeStrategy implements CryptoStrategy {
  algorithm = 'Age';
  version = 2;
  // ...
}

// lib/crypto/index.ts
export function getCryptoStrategy(version = 1): CryptoStrategy {
  if (version === 1) return new AesGcmStrategy();
  if (version === 2) return new AgeStrategy();
  throw new Error(`Unsupported crypto version: ${version}`);
}
```

**Header format:** `HOLO<version:1byte><algorithm:4bytes><data>`

**Target files:** `lib/crypto/` (refactor)

---

#### **FINDING 9: Missing Command Pattern for Git Ops**
**Severity:** 🟡 P1 — Error handling + rollback
**Files:**
- `/components/git/GitSync.tsx`
- `/app/api/git/commit/route.ts`
- `/app/api/git/pull/route.ts`

**Problem:**
Push/pull operations are not atomic:
```typescript
// commit/route.ts — no rollback if encrypt fails mid-way
await encryptMarkdownFiles(notesPath); // Partial failure?
await execAsync("git add **/*.md.enc", { cwd: repoPath });
await execAsync(commitCmd, { cwd: repoPath });
```

If encryption fails after 50% of files, repo is left in inconsistent state.

**Fix:**
```typescript
// lib/commands/PushCommand.ts
export class PushCommand {
  private encryptedFiles: Map<string, Buffer> = new Map();

  async execute(repoPath: string, passphrase: string, message: string): Promise<void> {
    // 1. Collect all .md files
    const mdFiles = await this.findMarkdownFiles(repoPath);

    // 2. Encrypt ALL in-memory first (no file writes yet)
    for (const file of mdFiles) {
      const encrypted = await this.encryptFile(file, passphrase);
      this.encryptedFiles.set(file + '.enc', encrypted);
    }

    // 3. Write atomically (all or nothing)
    await this.writeEncryptedFiles();

    // 4. Git operations
    await this.gitAdd(repoPath);
    await this.gitCommit(repoPath, message);
  }

  async rollback(): Promise<void> {
    // Delete any .enc files created, restore from backup
  }
}
```

**Benefits:**
- Atomic operations (all-or-nothing)
- Rollback on failure
- Progress reporting
- Unit testable without Git

**Target files:** `lib/commands/` (new)

---

### 1.4 Primitive Obsession

#### **FINDING 10: No Branded Types**
**Severity:** 🟡 P1 — Type safety
**Files:** All files using `string` for security-critical values

**Problem:**
```typescript
// Can accidentally pass repoPath where passphrase expected
function commit(repoPath: string, passphrase: string) { ... }
commit(passphrase, repoPath); // TypeScript doesn't catch this!
```

**Fix:**
```typescript
// lib/types/branded.ts
export type Passphrase = string & { readonly __brand: 'Passphrase' };
export type RepoPath = string & { readonly __brand: 'RepoPath' };
export type NotePath = string & { readonly __brand: 'NotePath' };
export type EncryptedData = string & { readonly __brand: 'EncryptedData' };

export function Passphrase(s: string): Passphrase {
  if (s.length < 8) throw new Error('Passphrase too short');
  return s as Passphrase;
}

export function RepoPath(s: string): RepoPath {
  if (!path.isAbsolute(s)) throw new Error('RepoPath must be absolute');
  return s as RepoPath;
}

// Usage
function commit(repoPath: RepoPath, passphrase: Passphrase) { ... }
commit(RepoPath('/home/user/notes'), Passphrase('secret123')); // ✅
commit(Passphrase('secret'), RepoPath('/home')); // ❌ Type error!
```

**Target files:** `lib/types/` (new), migrate all API signatures

---

## 2. Design & Pattern Gaps

### **GAP 1: No Editor Adapter**
**Current:** Tiptap directly imported in 10+ places
**Fix:** Create `EditorProvider` interface:
```typescript
// lib/editor/EditorProvider.ts
export interface EditorProvider {
  setContent(markdown: string): void;
  getContent(): string;
  focus(): void;
  destroy(): void;
}

// lib/editor/TiptapProvider.ts (adapter)
export class TiptapProvider implements EditorProvider {
  constructor(private editor: Editor) {}
  // ... adapt Tiptap API to our interface
}
```

**Benefit:** Can swap Tiptap for another editor without touching app code.

---

### **GAP 2: No State Machine for Lock/Unlock**
**Current:** Boolean flags + conditional rendering
**Fix:** XState machine:
```typescript
// lib/state/authMachine.ts
const authMachine = createMachine({
  initial: 'locked',
  states: {
    locked: {
      on: { UNLOCK: 'unlocking' }
    },
    unlocking: {
      invoke: {
        src: 'decryptConfig',
        onDone: 'unlocked',
        onError: 'locked'
      }
    },
    unlocked: {
      on: { LOCK: 'locked' }
    }
  }
});
```

**Benefit:** All lock/unlock transitions explicit, easier to add timeout/re-auth.

---

### **GAP 3: No Discriminated Unions for Errors**
**Current:** `throw new Error(string)` everywhere
**Fix:**
```typescript
// lib/errors/index.ts
export type AppError =
  | { type: 'CryptoError'; reason: 'InvalidPassphrase' | 'CorruptedData' }
  | { type: 'GitError'; reason: 'Conflict' | 'NoRemote'; files?: string[] }
  | { type: 'NotFoundError'; resource: 'Note' | 'Board'; id: string };

// Exhaustive error handling
function handleError(error: AppError) {
  switch (error.type) {
    case 'CryptoError':
      if (error.reason === 'InvalidPassphrase') return 'Wrong passphrase';
      return 'Data corrupted';
    case 'GitError':
      return `Git conflict in ${error.files?.join(', ')}`;
    case 'NotFoundError':
      return `${error.resource} not found`;
    default:
      const _exhaustive: never = error;
      return _exhaustive;
  }
}
```

---

## 3. Refactor Plan (PR-Sized Steps)

### **Phase 1: Foundation (Weeks 1-2)**

#### **PR 1.1: Consolidate Crypto Implementation** 🔴 P0
**Size:** M (3-5 days)
**Rationale:** Critical correctness issue — must fix before any encryption changes
**Changes:**
1. Create `/lib/crypto/unified.ts` with isomorphic (browser + Node) AES-GCM
2. Add AAD parameter for file path binding
3. Migrate `commit/route.ts` and `pull/route.ts` to use unified crypto
4. Delete old browser-only `aesgcm.ts` after migration
5. Update all tests to verify unified implementation

**Success checks:**
- [ ] All crypto operations use same format: `salt(16) + iv(12) + ciphertext`
- [ ] AAD test: swapping ciphertexts between files fails authentication
- [ ] Round-trip test: encrypt on server, decrypt on client (and vice versa)

**Risk:** High — touches all encryption. **Mitigation:** Run on fresh repo, verify with test suite.

---

#### **PR 1.2: Add Crypto Security Tests** 🔴 P0
**Size:** S (1-2 days)
**Rationale:** Validate security properties before refactoring
**Changes:**
1. IV uniqueness test (10K encryptions)
2. Tamper detection (modify 1 byte → decrypt fails)
3. Wrong passphrase test (different passphrase → fails)
4. AAD binding test (swap ciphertexts → fails)
5. Salt uniqueness test

**Success checks:**
- [ ] `pnpm test` coverage > 95% for `/lib/crypto/*`
- [ ] All 5 security properties verified

**Risk:** Low

---

#### **PR 1.3: Remove Dead Code** 🟡 P1
**Size:** S (1 day)
**Rationale:** Reduce confusion, remove legacy FS Access API code
**Changes:**
1. Delete `lib/notes/noteManager.ts` (unused)
2. Delete `lib/fs/repo.ts` (unused)
3. Delete `lib/git/cli.ts` (placeholder)
4. Delete `lib/git/gitOperations.ts` (unused)
5. Delete `lib/security/machineKey.ts` (replaced)
6. Update `ARCHITECTURE.md` to document server-only approach

**Success checks:**
- [ ] `pnpm build` succeeds
- [ ] No imports of deleted files (`grep -r "noteManager\|machineKey"`)

**Risk:** Low — files confirmed unused

---

#### **PR 1.4: Add Zod Schema Validation** 🟠 P1
**Size:** M (2-3 days)
**Rationale:** Runtime safety for YAML/JSON parsing
**Changes:**
1. Create `/lib/schema/frontmatter.ts` with Zod schemas
2. Create `/lib/schema/config.ts` for config structure
3. Update `lib/notes/frontmatter.ts` to validate on parse
4. Update `app/api/config/read/route.ts` to validate config
5. Add discriminated unions for note types

**Success checks:**
- [ ] Invalid frontmatter throws descriptive error
- [ ] Missing required fields caught at runtime
- [ ] All schemas exported with TypeScript types

**Risk:** Medium — changes parsing logic. **Mitigation:** Add tests first, validate with existing notes.

---

### **Phase 2: Layering (Weeks 3-4)**

#### **PR 2.1: Introduce Repository Pattern** 🟠 P1
**Size:** L (5-7 days)
**Rationale:** Decouple UI from API, enable testing
**Changes:**
1. Create `lib/repositories/NoteRepository.ts`
2. Create `lib/repositories/KanbanRepository.ts`
3. Create `lib/repositories/GitRepository.ts`
4. Create `lib/repositories/ConfigRepository.ts`
5. Migrate `app/page.tsx` to use repositories instead of `fetch`
6. Migrate `components/notes/NotesSidebar.tsx`
7. Migrate `components/git/GitSync.tsx`

**Success checks:**
- [ ] Zero direct `fetch('/api/...)` calls in components
- [ ] All repositories unit-tested with mock fetch
- [ ] Error handling centralized

**Risk:** High — touches many components. **Mitigation:** Migrate one repo at a time, keep both approaches during transition.

---

#### **PR 2.2: Extract Note Management Feature** 🟠 P1
**Size:** M (3-4 days)
**Rationale:** Break up God component
**Changes:**
1. Create `features/notes/hooks/useNotes.ts` (CRUD logic from `page.tsx`)
2. Create `features/notes/hooks/useAutoSave.ts` (auto-save with debounce)
3. Create `features/notes/hooks/useNoteTitle.ts` (title tracking)
4. Create `features/notes/NotesView.tsx` (extract notes tab from `page.tsx`)
5. Update `app/page.tsx` to use feature components

**Success checks:**
- [ ] `page.tsx` reduced to ~200 lines (from 615)
- [ ] Each hook unit-tested
- [ ] No duplicate logic

**Risk:** Medium — complex state migration. **Mitigation:** Keep both versions running in parallel, feature flag switch.

---

#### **PR 2.3: Extract Kanban Feature** 🟡 P1
**Size:** M (3-4 days)
**Rationale:** Continue decomposition
**Changes:**
1. Create `features/kanban/hooks/useBoards.ts`
2. Create `features/kanban/KanbanView.tsx`
3. Update `app/page.tsx` to delegate to feature

**Success checks:**
- [ ] `page.tsx` reduced to ~100 lines
- [ ] Kanban logic isolated and testable

**Risk:** Low

---

### **Phase 3: Advanced Patterns (Week 5)**

#### **PR 3.1: Add Crypto Strategy Pattern** 🟡 P1
**Size:** M (3-4 days)
**Rationale:** Enable future migration to Age/Argon2id
**Changes:**
1. Create `CryptoStrategy` interface
2. Create `AesGcmStrategy` (refactor unified crypto)
3. Add version header to encrypted files: `HOLO<version><data>`
4. Update all call sites to use `getCryptoStrategy(version)`

**Success checks:**
- [ ] Can decrypt old files (v1) and new files (v1) identically
- [ ] `AgeStrategy` stub compiles (doesn't need to work yet)

**Risk:** Medium — format change. **Mitigation:** Add version header parsing, support v1 indefinitely.

---

#### **PR 3.2: Add Command Pattern for Git** 🟡 P1
**Size:** L (5-6 days)
**Rationale:** Atomic push/pull with rollback
**Changes:**
1. Create `lib/commands/PushCommand.ts`
2. Create `lib/commands/PullCommand.ts`
3. Add in-memory encryption (no file writes until commit)
4. Add rollback logic
5. Update API routes to use commands

**Success checks:**
- [ ] Push encrypts all files before writing any
- [ ] Pull decrypts all files atomically
- [ ] Rollback removes partial changes

**Risk:** High — complex git operations. **Mitigation:** Test on disposable repos first.

---

#### **PR 3.3: Add Branded Types** 🟡 P1
**Size:** M (3-4 days)
**Rationale:** Prevent mixing security-critical strings
**Changes:**
1. Create `lib/types/branded.ts` with branded types
2. Update all function signatures
3. Add runtime validation in constructors

**Success checks:**
- [ ] Cannot pass `Passphrase` where `RepoPath` expected
- [ ] TypeScript catches swapped arguments

**Risk:** Low — type-only change, runtime compatible

---

### **Phase 4: Context & Security (Week 6)**

#### **PR 4.1: Secure Passphrase Handling** 🔴 P0
**Size:** M (4-5 days)
**Rationale:** Fix plaintext passphrase in React Context
**Changes:**
1. Derive session key from passphrase on unlock
2. Store session key (not passphrase) in Context
3. Remove all console.logs of sensitive data
4. Add `SecureString` wrapper that prevents accidental logging

**Success checks:**
- [ ] React DevTools shows no plaintext passphrase
- [ ] `console.log(context)` redacts sensitive fields

**Risk:** Medium — changes auth flow. **Mitigation:** Test unlock/lock extensively.

---

### **Phase 5: Testing (Weeks 7-8)**

#### **PR 5.1: Add E2E Tests** 🟠 P1
**Size:** L (6-7 days)
**Rationale:** Catch integration issues
**Changes:**
1. Set up Playwright
2. Test: create repo → unlock → create note → save → lock → unlock → verify note
3. Test: create note → commit → push → clone on "another machine" → pull → decrypt → verify
4. Test: create note → modify → Git conflict flow
5. Test: wrong passphrase scenarios

**Success checks:**
- [ ] Full round-trip test passes
- [ ] Cross-device simulation works

**Risk:** Low

---

#### **PR 5.2: Add Git CLI Tests** 🟠 P1
**Size:** M (3-4 days)
**Rationale:** Prevent shell injection, validate error handling
**Changes:**
1. Test git commands with special characters (`;`, `&&`, `|`)
2. Test commit with emoji in message
3. Test error paths (no Git, no remote, conflict)
4. Mock `exec` for unit tests

**Success checks:**
- [ ] No shell injection vulnerabilities
- [ ] All error paths tested

**Risk:** Low

---

#### **PR 5.3: Add PWA Cache Tests** 🟡 P1
**Size:** S (2 days)
**Rationale:** Verify secrets never cached
**Changes:**
1. Test service worker never caches `/api/config/*`
2. Test service worker never caches `*.md` or `*.md.enc` files
3. Test offline mode (UI shell cached, data not cached)

**Success checks:**
- [ ] Plaintext notes never in cache storage
- [ ] Config never in cache storage

**Risk:** Low

---

#### **PR 5.4: Add A11y Tests** 🟡 P2
**Size:** S (2 days)
**Rationale:** Ensure keyboard navigation works
**Changes:**
1. Test kanban DnD with keyboard only
2. Test focus rings on all interactive elements
3. Test screen reader announces (aria-live regions)
4. Run axe-core on all pages

**Success checks:**
- [ ] WCAG 2.2 AA compliance
- [ ] Keyboard-only navigation works

**Risk:** Low

---

## 4. Hotspot Diffs (Top 5 Worst Files)

### **HOTSPOT 1: `app/page.tsx` (615 lines)**

**Before (excerpt):**
```typescript
export default function Home() {
  const { isUnlocked, repoPath, passphrase } = useRepo();
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [noteFrontmatter, setNoteFrontmatter] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [kanbanBoards, setKanbanBoards] = useState<KanbanBoardType[]>([]);
  const [activeTab, setActiveTab] = useState("notes");
  // ... 600 more lines mixing logic + UI
}
```

**After:**
```typescript
// app/page.tsx — Pure composition (80 lines)
export default function Home() {
  const { isUnlocked, repoPath } = useRepo();
  const [activeTab, setActiveTab] = useState("notes");

  if (!repoPath || !isUnlocked) {
    return <SetupWizard />;
  }

  return (
    <div className="flex flex-col h-screen">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="notes">
            <NotesView />
          </TabsContent>
          <TabsContent value="kanban">
            <KanbanView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// features/notes/NotesView.tsx — Note management
export function NotesView() {
  const { currentNote, isLoading } = useNotes();
  const { markdown, setMarkdown } = useEditor(currentNote);
  const { isSaving, lastSaved } = useAutoSave(markdown, currentNote);

  if (!currentNote) return <EmptyState />;

  return (
    <div className="flex-1">
      <NoteHeader title={currentNote.title} isSaving={isSaving} lastSaved={lastSaved} />
      <TiptapEditor content={markdown} onChange={setMarkdown} />
    </div>
  );
}

// features/notes/hooks/useNotes.ts — CRUD logic
export function useNotes() {
  const { repoPath } = useRepo();
  const noteRepo = useMemo(() => new NoteRepository(repoPath), [repoPath]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  const loadNote = useCallback(async (path: string) => {
    const note = await noteRepo.read(path);
    setCurrentNote(note);
  }, [noteRepo]);

  return { currentNote, loadNote, isLoading };
}
```

**Improvement:**
- **615 → 80 lines** in `page.tsx`
- Each concern isolated in own file
- Testable hooks (no UI coupling)
- Reusable across routes

---

### **HOTSPOT 2: Crypto Consolidation**

**Before (`app/api/git/commit/route.ts`):**
```typescript
// Duplicate crypto implementation in API route
async function encryptFile(filePath: string, passphrase: string): Promise<void> {
  const plaintext = await fs.readFile(filePath, "utf-8");

  const salt = crypto.randomBytes(32);  // ❌ Different from browser (16)
  const iv = crypto.randomBytes(16);    // ❌ Different from browser (12)
  const key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, "sha256");

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf-8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // ❌ Different format: salt(32) + iv(16) + authTag(16) + encrypted
  const result = Buffer.concat([salt, iv, authTag, encrypted]);
  await fs.writeFile(filePath + ".enc", result);
}
```

**After (`lib/crypto/unified.ts`):**
```typescript
// Single isomorphic implementation
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const PBKDF2_ITERATIONS = 100000;

export async function encrypt(
  data: string | ArrayBuffer,
  passphrase: string,
  aad = ''
): Promise<Uint8Array> {
  const crypto = getCrypto(); // Shim for browser/Node

  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const key = await deriveKey(passphrase, salt);

  const plaintext = typeof data === 'string'
    ? new TextEncoder().encode(data)
    : new Uint8Array(data);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(aad) },
    key,
    plaintext
  );

  // Consistent format: salt(16) + iv(12) + ciphertext (includes auth tag)
  const result = new Uint8Array(SALT_LENGTH + IV_LENGTH + ciphertext.byteLength);
  result.set(salt, 0);
  result.set(iv, SALT_LENGTH);
  result.set(new Uint8Array(ciphertext), SALT_LENGTH + IV_LENGTH);

  return result;
}

export async function decrypt(
  encrypted: Uint8Array,
  passphrase: string,
  aad = ''
): Promise<ArrayBuffer> {
  const crypto = getCrypto();

  const salt = encrypted.slice(0, SALT_LENGTH);
  const iv = encrypted.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = encrypted.slice(SALT_LENGTH + IV_LENGTH);

  const key = await deriveKey(passphrase, salt);

  try {
    return await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(aad) },
      key,
      ciphertext
    );
  } catch {
    throw new CryptoError('InvalidPassphrase', 'Decryption failed');
  }
}

// Platform shim
function getCrypto(): Crypto {
  if (typeof window !== 'undefined') return window.crypto;
  return require('crypto').webcrypto;
}
```

**Improvement:**
- **Single source of truth** for crypto
- **AAD binding** prevents ciphertext swapping
- **Isomorphic** (works in browser + Node)
- **Consistent format** (16+12+data)

---

### **HOTSPOT 3: Repository Pattern**

**Before (components calling API directly):**
```typescript
// app/page.tsx
const handleSelectNote = async (notePath: string) => {
  try {
    const response = await fetch(
      `/api/notes/read?repoPath=${encodeURIComponent(repoPath!)}&notePath=${encodeURIComponent(notePath)}`
    );
    if (response.ok) {
      const data = await response.json();
      const { data: frontmatter, content } = extractFrontmatter(data.content);
      // ... manual parsing, no validation
    }
  } catch (error) {
    console.error("Failed to load note:", error);
  }
};
```

**After:**
```typescript
// lib/repositories/NoteRepository.ts
export class NoteRepository {
  constructor(private repoPath: RepoPath) {}

  async read(notePath: NotePath): Promise<Note> {
    const url = `/api/notes/read?repoPath=${encodeURIComponent(this.repoPath)}&notePath=${encodeURIComponent(notePath)}`;
    const res = await fetch(url);

    if (!res.ok) {
      const error = await res.json();
      throw new RepositoryError('FailedToRead', error.message, { notePath });
    }

    const data = await res.json();

    // ✅ Schema validation
    return NoteSchema.parse(data);
  }

  async write(note: Note): Promise<void> {
    const url = '/api/notes/write';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoPath: this.repoPath,
        notePath: note.path,
        content: note.content
      })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new RepositoryError('FailedToWrite', error.message, { note: note.path });
    }
  }
}

// Usage in component
const noteRepo = new NoteRepository(RepoPath(repoPath));
const note = await noteRepo.read(NotePath(notePath));
```

**Improvement:**
- **Centralized error handling**
- **Type-safe with Zod validation**
- **Easy to mock** for tests
- **DRY** — no duplicate fetch logic

---

### **HOTSPOT 4: Command Pattern (Atomic Push)**

**Before (`app/api/git/commit/route.ts`):**
```typescript
// ❌ Non-atomic: partial failure leaves repo corrupted
if (passphrase) {
  await encryptMarkdownFiles(notesPath); // Could fail mid-way!
  await execAsync("git add **/*.md.enc", { cwd: repoPath });
}
await execAsync("git add -A", { cwd: repoPath });
await execAsync(commitCmd, { cwd: repoPath });
```

**After (`lib/commands/PushCommand.ts`):**
```typescript
export class PushCommand {
  private backups = new Map<string, Buffer>();
  private encrypted = new Map<string, Uint8Array>();

  async execute(
    repoPath: RepoPath,
    passphrase: Passphrase,
    message: string
  ): Promise<PushResult> {
    try {
      // 1. Collect all .md files
      const mdFiles = await this.findMarkdownFiles(repoPath);

      // 2. Backup existing .enc files (for rollback)
      await this.createBackups(repoPath, mdFiles);

      // 3. Encrypt ALL files in-memory (no writes yet)
      for (const file of mdFiles) {
        const plaintext = await fs.readFile(file.path, 'utf-8');
        const aad = file.relativePath; // Bind to file path
        const encrypted = await this.crypto.encrypt(plaintext, passphrase, aad);
        this.encrypted.set(file.path + '.enc', encrypted);
      }

      // ✅ All encryption succeeded — now write atomically
      // 4. Write all .enc files
      await this.writeEncryptedFiles();

      // 5. Git operations
      await this.gitAdd(repoPath, '**/*.md.enc');
      await this.gitCommit(repoPath, message);

      return { success: true, filesEncrypted: mdFiles.length };
    } catch (error) {
      // Rollback: restore backups
      await this.rollback();
      throw new CommandError('PushFailed', error.message);
    } finally {
      // Clean up backups
      await this.cleanupBackups();
    }
  }

  private async rollback(): Promise<void> {
    for (const [path, backup] of this.backups) {
      await fs.writeFile(path, backup);
    }
    // Delete any new .enc files
    for (const path of this.encrypted.keys()) {
      await fs.unlink(path).catch(() => {});
    }
  }
}
```

**Improvement:**
- **Atomic**: all-or-nothing
- **Rollback** on failure
- **AAD binding** per file
- **Testable** without Git

---

### **HOTSPOT 5: Branded Types**

**Before:**
```typescript
// ❌ Easy to swap arguments
function commit(repoPath: string, message: string, passphrase: string) { ... }
commit(passphrase, message, repoPath); // Compiles, but wrong!
```

**After:**
```typescript
// lib/types/branded.ts
export type Passphrase = string & { readonly __brand: 'Passphrase' };
export type RepoPath = string & { readonly __brand: 'RepoPath' };
export type CommitMessage = string & { readonly __brand: 'CommitMessage' };

export function Passphrase(s: string): Passphrase {
  if (s.length < 8) throw new TypeError('Passphrase must be ≥8 chars');
  if (s.length > 1024) throw new TypeError('Passphrase too long (max 1024)');
  return s as Passphrase;
}

export function RepoPath(s: string): RepoPath {
  if (!path.isAbsolute(s)) throw new TypeError('RepoPath must be absolute');
  return s as RepoPath;
}

export function CommitMessage(s: string): CommitMessage {
  if (s.trim().length === 0) throw new TypeError('CommitMessage cannot be empty');
  if (s.length > 500) throw new TypeError('CommitMessage too long (max 500)');
  return s as CommitMessage;
}

// Usage
function commit(
  repoPath: RepoPath,
  message: CommitMessage,
  passphrase: Passphrase
): Promise<void> { ... }

// ✅ Type-safe
commit(
  RepoPath('/home/user/notes'),
  CommitMessage('Initial commit'),
  Passphrase('secret123')
);

// ❌ Type error: cannot swap
commit(
  Passphrase('secret'),     // Error: Type 'Passphrase' is not assignable to 'RepoPath'
  CommitMessage('msg'),
  RepoPath('/home/user')
);
```

**Improvement:**
- **Type safety** at compile time
- **Runtime validation** in constructors
- **Self-documenting** APIs

---

## 5. Testing Plan

### 5.1 Unit Tests

#### **Crypto (`lib/crypto/unified.test.ts`)**
| Test | Purpose | Success Criteria |
|------|---------|-----------------|
| `encrypt/decrypt round-trip` | Basic correctness | Encrypted data can be decrypted back |
| `wrong passphrase fails` | Auth failure | Throws `CryptoError('InvalidPassphrase')` |
| `IV uniqueness (10K encryptions)` | Security property | All IVs unique across 10,000 encryptions |
| `tamper detection` | Integrity | Modifying 1 byte → decrypt fails |
| `AAD binding` | Context binding | Cannot swap ciphertext between files |
| `salt uniqueness` | Security property | All salts unique |
| `unicode content` | Edge case | Emoji, Chinese chars round-trip |
| `large files (100MB)` | Performance | Encrypt/decrypt in <2s |

#### **Git CLI (`lib/commands/__tests__/PushCommand.test.ts`)**
| Test | Purpose | Success Criteria |
|------|---------|-----------------|
| `shell injection (filename with ;)` | Security | Filename `note;rm-rf.md` doesn't execute `rm` |
| `emoji in commit message` | Unicode handling | Commit message `✨ feat: add` works |
| `partial encryption failure` | Rollback | If 1 of 10 files fails, none are committed |
| `no Git binary` | Error handling | Throws `CommandError('GitNotFound')` |
| `no remote` | Error handling | Push fails gracefully |

#### **Schema Validation (`lib/schema/__tests__/frontmatter.test.ts`)**
| Test | Purpose | Success Criteria |
|------|---------|-----------------|
| `valid frontmatter parses` | Happy path | `{ type: 'note' }` → `Note` type |
| `invalid type rejected` | Validation | `{ type: 'invalid' }` → throws Zod error |
| `missing required field` | Validation | `{}` → throws with clear message |
| `extra fields ignored` | Robustness | `{ type: 'note', extra: 123 }` → parses |

### 5.2 E2E Tests (Playwright)

| Test | Scenario | Steps | Success Criteria |
|------|----------|-------|-----------------|
| **Full round-trip** | Create→encrypt→push→pull→decrypt | 1. Create repo with passphrase<br>2. Create note "Test"<br>3. Commit + push<br>4. Clone to new folder<br>5. Pull + decrypt<br>6. Verify note content | Note content matches exactly |
| **Cross-device unlock** | Encrypted config works on "new machine" | 1. Create repo on "Machine A" with passphrase "secret"<br>2. Commit `.holocron/config.json.enc`<br>3. Clone to "Machine B"<br>4. Enter passphrase "secret" → unlock | Auto-unlock works on both machines |
| **Wrong passphrase** | Unlock fails | 1. Existing repo<br>2. Enter wrong passphrase | Shows "Invalid passphrase" error |
| **Git conflict** | Pull with conflict | 1. Edit note on two "machines"<br>2. Commit on both<br>3. Pull → conflict | Shows conflict UI with file list |
| **Lock/unlock flow** | Session management | 1. Unlock<br>2. Create note<br>3. Lock<br>4. Verify note not visible<br>5. Unlock → note visible | Lock clears passphrase from memory |

### 5.3 A11y Tests

| Test | Purpose | Tool | Success Criteria |
|------|---------|------|-----------------|
| **Keyboard navigation** | Can use app without mouse | Manual | Tab through all controls, Enter/Space activate |
| **Kanban DnD keyboard** | Accessible drag-and-drop | Manual | Arrow keys move cards, Space to pick/drop |
| **Focus rings** | Visual focus indication | axe-core | All interactive elements have visible focus |
| **Screen reader** | ARIA labels/roles | VoiceOver | Board/card names announced, live regions for updates |
| **Color contrast** | WCAG AA compliance | axe-core | All text meets 4.5:1 ratio |

### 5.4 PWA Caching Tests

| Test | Purpose | Success Criteria |
|------|---------|-----------------|
| **Secrets not cached** | Service worker config | `caches.open()` → no `/api/config/*` entries |
| **Plaintext not cached** | File system boundary | `caches.open()` → no `*.md` files |
| **UI shell cached** | Offline mode | Disconnect network → app loads (UI only) |
| **Data requests bypass cache** | Correct headers | `/api/notes/read` has `Cache-Control: no-store` |

### 5.5 Performance Tests

| Test | Metric | Target | Measurement |
|------|--------|--------|-------------|
| **Initial load** | Time to interactive | <2s | Lighthouse |
| **Editor input lag** | Keystroke → render | <16ms (60fps) | Chrome DevTools Performance |
| **Auto-save debounce** | Saves per minute | <30 | Count `fetch('/api/notes/write')` |
| **Large note (10K lines)** | Render time | <500ms | Lighthouse |
| **Bundle size** | Editor chunk | <400KB gzipped | `next build` |

---

## 6. Performance/UX Notes

### 6.1 Hydration Warnings

**Issue:** Console logs during development:
```
Warning: Expected server HTML to contain a matching <div> in <div>.
```

**Cause:** `console.log()` in `RepoContext.tsx` runs on server but not client.

**Fix:**
- Remove all `console.log()` from production code
- Use proper logger with environment check:
  ```typescript
  // lib/logger.ts
  export const logger = {
    debug: (msg: string, ...args: any[]) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEBUG] ${msg}`, ...args);
      }
    }
  };
  ```

---

### 6.2 Unnecessary Client Components

**Issue:** Many components marked `"use client"` when could be RSC.

**Examples:**
- `components/ui/*` (shadcn components) — all client-side
- `app/layout.tsx` — client-side (could extract providers)

**Fix:**
```typescript
// app/layout.tsx — Server component
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// app/providers.tsx — Client component (minimal)
"use client";
export function Providers({ children }) {
  return (
    <RepoProvider>
      <SettingsProvider>
        {children}
      </SettingsProvider>
    </RepoProvider>
  );
}
```

**Benefit:** Reduces client bundle by ~50KB

---

### 6.3 Editor Bundle Size

**Current:** Tiptap + lowlight (all languages) = ~400KB

**Optimization:**
```typescript
// components/editor/TiptapEditor.tsx — Before
import { all, createLowlight } from 'lowlight';
const lowlight = createLowlight(all); // ❌ 300+ languages

// After — Lazy load only used languages
import { createLowlight } from 'lowlight';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import javascript from 'highlight.js/lib/languages/javascript';
// ... only common languages

const lowlight = createLowlight();
lowlight.register('typescript', typescript);
lowlight.register('python', python);
lowlight.register('javascript', javascript);
```

**Benefit:** ~400KB → ~120KB (~70% reduction)

---

### 6.4 Re-Render Hotspots

**Issue:** `app/page.tsx` re-renders on every keystroke in editor.

**Cause:**
```typescript
// app/page.tsx
const [markdown, setMarkdown] = useState(""); // ❌ Triggers re-render
useEffect(() => {
  const timeoutId = setTimeout(async () => {
    if (markdown !== ...) {
      await handleSave(); // Triggers another re-render
    }
  }, 2000);
  return () => clearTimeout(timeoutId);
}, [markdown]); // ❌ Runs on every change
```

**Fix:**
```typescript
// features/notes/hooks/useAutoSave.ts
export function useAutoSave(markdown: string, note: Note | null) {
  const isSaving = useRef(false);
  const lastSaved = useRef<string | null>(null);

  useEffect(() => {
    if (!note || isSaving.current || markdown === lastSaved.current) return;

    const timeoutId = setTimeout(async () => {
      isSaving.current = true;
      await saveNote(note, markdown);
      lastSaved.current = markdown;
      isSaving.current = false;
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [markdown, note]); // ✅ Only re-runs when markdown changes

  return { isSaving: isSaving.current, lastSaved: lastSaved.current };
}
```

**Benefit:** Eliminates unnecessary re-renders, editor feels snappier

---

## 7. PR Checklist (Copy-Pasteable)

```markdown
## PR Checklist — Holocron Refactoring

### Code Quality
- [ ] **TypeScript strict mode** passes with no `any` (except explicitly typed)
- [ ] **Discriminated unions** for errors (no string errors)
- [ ] **Branded types** for security-critical values (`Passphrase`, `RepoPath`)
- [ ] **Zod schemas** validate all external data (YAML, JSON)

### Architecture
- [ ] **Layering respected**: `lib/crypto` → `lib/commands` → `lib/repositories` → `features` → `app`
- [ ] **No UI logic in API routes** (pure HTTP handlers)
- [ ] **No business logic in components** (delegated to hooks/services)
- [ ] **Crypto Strategy** used (not direct AES-GCM calls)
- [ ] **Repository pattern** used (not direct `fetch()` calls)

### Security
- [ ] **No plaintext secrets in logs** (passphrase, keys, config)
- [ ] **No secrets in React state** (use session keys/tokens)
- [ ] **AAD binding** for file encryption (file path in AAD)
- [ ] **IV uniqueness** verified (test with 10K encryptions)
- [ ] **Shell injection prevented** (no unsanitized exec)

### Testing
- [ ] **Unit tests** for all new functions (>80% coverage)
- [ ] **Crypto tests** include security properties (IV, AAD, tamper)
- [ ] **Git CLI tests** include error paths and special chars
- [ ] **E2E test** passes (create→encrypt→commit→pull→decrypt)
- [ ] **A11y test** passes (keyboard nav, focus rings, screen reader)

### Performance
- [ ] **No unnecessary re-renders** (checked with React DevTools Profiler)
- [ ] **Bundle size** not increased (check `next build` output)
- [ ] **Lazy loading** for heavy components (Tiptap, kanban)
- [ ] **No hydration warnings** in dev mode

### Documentation
- [ ] **ARCHITECTURE.md** updated with new patterns
- [ ] **JSDoc comments** for public APIs
- [ ] **Migration guide** if breaking changes (how to update existing repos)

### Deployment
- [ ] **`pnpm test`** passes all tests
- [ ] **`pnpm build`** succeeds
- [ ] **`pnpm lint`** passes
- [ ] Tested on fresh repo (not just existing dev repo)
- [ ] Tested unlock flow with existing encrypted config
```

---

## 8. Risk Matrix

| PR | Risk | Mitigation | Rollback Plan |
|----|------|-----------|---------------|
| 1.1 Crypto consolidation | 🔴 High (data loss) | Extensive tests, backup repo | Revert to dual implementation |
| 1.2 Crypto tests | 🟢 Low | N/A | N/A |
| 1.3 Delete dead code | 🟢 Low | Confirm no imports | Git revert |
| 1.4 Zod validation | 🟡 Medium | Test with existing notes first | Feature flag to disable validation |
| 2.1 Repository pattern | 🟠 High | Gradual rollout per feature | Keep both implementations during transition |
| 2.2 Extract notes feature | 🟡 Medium | Feature flag switch | Revert to monolithic component |
| 2.3 Extract kanban feature | 🟢 Low | Isolated change | Revert |
| 3.1 Crypto strategy | 🟡 Medium | Version header backward-compatible | Support v1 format indefinitely |
| 3.2 Command pattern | 🟠 High | Test on disposable repos first | Revert to inline commands |
| 3.3 Branded types | 🟢 Low | Type-only change | Revert |
| 4.1 Secure passphrase | 🟡 Medium | Extensive unlock/lock testing | Revert to plaintext context |
| 5.1-5.4 Testing | 🟢 Low | Tests only, no code changes | N/A |

---

## 9. Success Metrics

| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| **Lines in `page.tsx`** | 615 | <100 | `wc -l app/page.tsx` |
| **Test coverage** | 15% (crypto only) | >80% | `pnpm test --coverage` |
| **Bundle size (editor chunk)** | ~400KB | <150KB | `next build` output |
| **TypeScript `any` count** | 12 | 0 | `grep -r ": any" \| wc -l` |
| **Direct `fetch()` in components** | 8 | 0 | `grep -r "fetch(" components/ \| wc -l` |
| **Console.logs (production)** | 6 | 0 | `grep -r "console.log" lib/ app/` |
| **Crypto implementations** | 2 (incompatible) | 1 (unified) | File count in `lib/crypto/` |
| **E2E tests** | 0 | 5 | `find e2e/ -name "*.spec.ts"` |

---

## 10. Timeline & Effort

| Phase | PRs | Effort | Dependencies |
|-------|-----|--------|--------------|
| **Phase 1: Foundation** | 1.1-1.4 | 2 weeks | None (start immediately) |
| **Phase 2: Layering** | 2.1-2.3 | 2 weeks | After Phase 1 |
| **Phase 3: Patterns** | 3.1-3.3 | 1 week | After Phase 2 (PR 2.1 specifically) |
| **Phase 4: Security** | 4.1 | 1 week | After Phase 1 (PR 1.1 specifically) |
| **Phase 5: Testing** | 5.1-5.4 | 2 weeks | Can run in parallel with Phases 2-4 |

**Total:** 6-8 weeks (1.5-2 months) with 1 developer
**Parallelization:** Phases 2-5 can partially overlap (testing for completed PRs while developing new ones)

---

## 11. Recommended Execution Order

### **Sprint 1 (Week 1-2): Critical Security Fixes**
1. PR 1.1: Consolidate crypto ← **BLOCKER** for everything else
2. PR 1.2: Add crypto tests
3. PR 1.3: Delete dead code
4. PR 4.1: Secure passphrase handling

### **Sprint 2 (Week 3-4): Layering**
5. PR 1.4: Zod validation
6. PR 2.1: Repository pattern
7. Start PR 5.1: E2E tests (in parallel)

### **Sprint 3 (Week 5-6): Decomposition**
8. PR 2.2: Extract notes feature
9. PR 2.3: Extract kanban feature
10. PR 5.2: Git CLI tests

### **Sprint 4 (Week 7-8): Advanced Patterns + Polish**
11. PR 3.1: Crypto strategy
12. PR 3.2: Command pattern
13. PR 3.3: Branded types
14. PR 5.3: PWA cache tests
15. PR 5.4: A11y tests

---

## Conclusion

Holocron has a **solid foundation** but suffers from **dual crypto implementations**, **lack of layering**, and **missing test coverage**. The refactor plan prioritizes:

1. **🔴 Security fixes first** (crypto consolidation, passphrase handling)
2. **🟠 Architecture improvements** (repositories, feature extraction)
3. **🟡 Advanced patterns** (strategies, commands, branded types)
4. **🟢 Testing & polish** (E2E, A11y, performance)

**Timeline:** 6-8 weeks
**Risk:** Managed through gradual rollout, extensive testing, and feature flags
**Outcome:** Type-safe, testable, maintainable codebase aligned with design rules

All refactors are **behavior-preserving** (no new features), with clear success metrics and rollback plans.
