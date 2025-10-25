# Repository Pattern - Usage Guide

## Overview

The repository pattern provides a centralized, type-safe data access layer that decouples UI components from direct API calls.

## Architecture

```
Components → Repositories → API Routes → File System
```

**Benefits**:
- ✅ Centralized error handling
- ✅ Type-safe responses
- ✅ Easy to mock for testing
- ✅ Consistent API across data access
- ✅ Single place to update when APIs change

---

## Quick Start

### 1. Import Repositories

```typescript
import {
  NoteRepository,
  ConfigRepository,
  GitRepository,
  RepositoryError
} from "@/lib/repositories";
```

### 2. Create Repository Instances

```typescript
const repoPath = "/path/to/repo";
const noteRepo = new NoteRepository(repoPath);
const configRepo = new ConfigRepository(repoPath);
const gitRepo = new GitRepository(repoPath);
```

### 3. Use Repository Methods

```typescript
// List all notes
const notes = await noteRepo.list();

// Read a note
const note = await noteRepo.read("notes/2025/10/25/my-note.md");

// Write a note
await noteRepo.write({
  notePath: "notes/2025/10/25/new-note.md",
  content: "# My Note\n\nContent here",
  metadata: {
    title: "My Note",
    type: "note",
    tags: ["example"]
  }
});
```

---

## Examples

### Example 1: Note CRUD Operations

```typescript
import { NoteRepository, RepositoryError } from "@/lib/repositories";

async function loadNote(repoPath: string, notePath: string) {
  const noteRepo = new NoteRepository(repoPath);

  try {
    const { content, metadata } = await noteRepo.read(notePath);
    return { content, metadata };
  } catch (error) {
    if (error instanceof RepositoryError) {
      if (error.is("NOT_FOUND")) {
        console.log("Note doesn't exist, creating new...");
        return { content: "", metadata: {} };
      }
      console.error("Failed to load note:", error.message);
    }
    throw error;
  }
}

async function saveNote(repoPath: string, notePath: string, content: string) {
  const noteRepo = new NoteRepository(repoPath);

  try {
    await noteRepo.write({
      notePath,
      content,
      metadata: {
        title: extractTitle(content),
        tags: extractTags(content),
      }
    });
    console.log("Note saved successfully");
  } catch (error) {
    if (error instanceof RepositoryError) {
      console.error("Save failed:", error.message);
      // Show user-friendly error message
    }
    throw error;
  }
}
```

---

### Example 2: Config Management

```typescript
import { ConfigRepository, RepositoryError } from "@/lib/repositories";
import { Config } from "@/lib/schema/config";

async function loadConfig(repoPath: string, passphrase: string) {
  const configRepo = new ConfigRepository(repoPath);

  try {
    const config = await configRepo.read(passphrase);
    return config;
  } catch (error) {
    if (error instanceof RepositoryError) {
      if (error.is("INVALID_PASSPHRASE")) {
        // Show "wrong passphrase" message
        return null;
      }
      if (error.is("CONFIG_NOT_FOUND")) {
        // Config doesn't exist, create default
        return createDefaultConfig(passphrase);
      }
    }
    throw error;
  }
}

async function updateSettings(
  repoPath: string,
  passphrase: string,
  settings: Partial<Config["settings"]>
) {
  const configRepo = new ConfigRepository(repoPath);

  // Read existing config
  const config = await configRepo.read(passphrase);

  // Merge settings
  const updated = {
    ...config,
    settings: { ...config.settings, ...settings },
    updatedAt: new Date().toISOString(),
  };

  // Write back
  await configRepo.write(updated, passphrase);
}
```

---

### Example 3: Git Operations

```typescript
import { GitRepository, RepositoryError } from "@/lib/repositories";

async function commitAndPush(
  repoPath: string,
  message: string,
  passphrase?: string
) {
  const gitRepo = new GitRepository(repoPath);

  try {
    // Check status first
    const status = await gitRepo.status();
    if (status.modified.length === 0 && status.untracked.length === 0) {
      console.log("No changes to commit");
      return;
    }

    // Commit changes
    const commitResult = await gitRepo.commit({
      message,
      passphrase,
      author: {
        name: "User Name",
        email: "user@example.com"
      }
    });

    console.log("Committed:", commitResult.hash);

    // Push to remote
    await gitRepo.push();
    console.log("Pushed to remote");

  } catch (error) {
    if (error instanceof RepositoryError) {
      console.error("Git operation failed:", error.message);
    }
    throw error;
  }
}

async function syncWithRemote(repoPath: string, passphrase?: string) {
  const gitRepo = new GitRepository(repoPath);

  try {
    // Pull latest changes
    await gitRepo.pull({ passphrase });

    // Check if ahead of remote
    const status = await gitRepo.status();
    if (status.ahead > 0) {
      // Push local commits
      await gitRepo.push();
    }

    return { pulled: true, pushed: status.ahead > 0 };
  } catch (error) {
    if (error instanceof RepositoryError) {
      console.error("Sync failed:", error.message);
    }
    throw error;
  }
}
```

---

### Example 4: React Hook Integration

```typescript
import { useState, useEffect } from "react";
import { NoteRepository, RepositoryError } from "@/lib/repositories";

function useNote(repoPath: string, notePath: string) {
  const [note, setNote] = useState<{ content: string; metadata?: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const noteRepo = new NoteRepository(repoPath);

    async function load() {
      try {
        setLoading(true);
        const data = await noteRepo.read(notePath);
        setNote(data);
        setError(null);
      } catch (err) {
        if (err instanceof RepositoryError) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [repoPath, notePath]);

  const save = async (content: string) => {
    const noteRepo = new NoteRepository(repoPath);
    try {
      await noteRepo.write({ notePath, content });
      setNote({ content, metadata: note?.metadata });
    } catch (err) {
      if (err instanceof RepositoryError) {
        setError(err.message);
      }
      throw err;
    }
  };

  return { note, loading, error, save };
}

// Usage in component:
function NoteEditor({ repoPath, notePath }: Props) {
  const { note, loading, error, save } = useNote(repoPath, notePath);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <textarea
      value={note?.content}
      onChange={(e) => save(e.target.value)}
    />
  );
}
```

---

## Error Handling

### RepositoryError Properties

```typescript
interface RepositoryError extends Error {
  code?: string;        // Error code (e.g., "NOT_FOUND", "INVALID_PASSPHRASE")
  statusCode?: number;  // HTTP status code
  details?: unknown;    // Additional error details

  is(code: string): boolean;  // Check error type
}
```

### Common Error Codes

| Code | Meaning | Status |
|------|---------|--------|
| `NOT_FOUND` | Resource doesn't exist | 404 |
| `INVALID_PASSPHRASE` | Wrong passphrase | 401 |
| `VALIDATION_FAILED` | Invalid data structure | 422 |
| `READ_FAILED` | Failed to read resource | 500 |
| `WRITE_FAILED` | Failed to write resource | 500 |
| `COMMIT_FAILED` | Git commit failed | 500 |
| `PUSH_FAILED` | Git push failed | 500 |

### Error Handling Pattern

```typescript
try {
  const result = await repository.someMethod();
} catch (error) {
  if (error instanceof RepositoryError) {
    // Specific error handling
    if (error.is("NOT_FOUND")) {
      // Handle not found
    } else if (error.is("INVALID_PASSPHRASE")) {
      // Handle wrong passphrase
    } else {
      // Generic repository error
      console.error(error.message, error.details);
    }
  } else {
    // Unexpected error
    throw error;
  }
}
```

---

## Testing with Repositories

### Mock Repository for Tests

```typescript
import { NoteRepository } from "@/lib/repositories";

// Mock fetch globally
global.fetch = jest.fn();

describe("MyComponent", () => {
  it("should load note", async () => {
    // Mock successful response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: "# Test Note",
        metadata: { title: "Test" }
      })
    });

    const noteRepo = new NoteRepository("/test/repo");
    const note = await noteRepo.read("test.md");

    expect(note.content).toBe("# Test Note");
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/notes/read")
    );
  });

  it("should handle not found error", async () => {
    // Mock 404 response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        error: "Note not found",
        code: "NOT_FOUND"
      })
    });

    const noteRepo = new NoteRepository("/test/repo");

    await expect(noteRepo.read("missing.md"))
      .rejects
      .toThrow("Note not found");
  });
});
```

---

## Migration Guide

### Before (Direct API Calls)

```typescript
// ❌ Old way - direct fetch
const response = await fetch(
  `/api/notes/read?repoPath=${repoPath}&notePath=${notePath}`
);
if (!response.ok) {
  throw new Error("Failed to read note");
}
const data = await response.json();
```

### After (Repository Pattern)

```typescript
// ✅ New way - repository
const noteRepo = new NoteRepository(repoPath);
const data = await noteRepo.read(notePath);
```

**Benefits**:
- No URL construction
- Automatic error handling
- Type-safe responses
- Easy to test

---

## API Reference

See individual repository files for complete API:
- [NoteRepository.ts](./NoteRepository.ts)
- [ConfigRepository.ts](./ConfigRepository.ts)
- [GitRepository.ts](./GitRepository.ts)
- [KanbanRepository.ts](./KanbanRepository.ts)
- [base.ts](./base.ts) - Base repository and error classes

---

## Best Practices

1. **Create repositories at component mount** - Don't create on every render
2. **Use error codes for conditional logic** - Check `error.is("NOT_FOUND")` not status codes
3. **Keep repositories stateless** - Don't store state in repository instances
4. **Mock fetch in tests** - Don't hit real API endpoints
5. **Handle all error cases** - Use try/catch with RepositoryError checks

---

**Last Updated**: 2025-10-25
