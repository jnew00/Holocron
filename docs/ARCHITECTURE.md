# Holocron Architecture Documentation

## Overview

Holocron is a local-first, encrypted note-taking application built with Next.js 14, React, TypeScript, and TipTap editor. It uses Git for version control and AES-256-GCM encryption for security.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  (React Components with shadcn/ui + Tailwind)               │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│                    Custom Hooks Layer                        │
│  (Business Logic, State Management, Side Effects)           │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│                   Service Layer                              │
│  ├─ Git Operations (gitService.ts)                          │
│  ├─ Crypto Operations (cryptoService.ts)                    │
│  ├─ File System (Repository Pattern)                        │
│  └─ Data Persistence (notesService.ts, kanbanService.ts)    │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│                 File System API Layer                        │
│  (Browser File System Access API)                           │
└─────────────────────────────────────────────────────────────┘
```

## Core Design Principles

### 1. Separation of Concerns

Each layer has a distinct responsibility:

- **UI Layer**: Presentation only, no business logic
- **Hooks Layer**: Business logic, state management, side effects
- **Service Layer**: Data access, external APIs, I/O operations
- **Storage Layer**: File system interactions

### 2. Component Composition

Components are built from smaller, focused pieces:

```typescript
// Main component orchestrates smaller components
export const ParentComponent = memo(function ParentComponent() {
  const state = useCustomHook();

  return (
    <Container>
      <ChildComponent1 {...state.props1} />
      <ChildComponent2 {...state.props2} />
    </Container>
  );
});
```

### 3. Custom Hooks Pattern

Business logic is extracted into custom hooks:

```typescript
export function useFeature(params): UseFeatureReturn {
  const [state, setState] = useState(initialState);

  const handleAction = useCallback(() => {
    // Business logic here
  }, [dependencies]);

  return { state, handleAction };
}
```

### 4. Type Safety

TypeScript strict mode is enabled throughout:

```typescript
interface UseFeatureParams {
  required: string;
  optional?: number;
}

interface UseFeatureReturn {
  state: StateType;
  handleAction: () => void;
}
```

## Directory Structure

```
/Holocron
├── app/                    # Next.js app router
│   └── page.tsx           # Main application entry
├── components/            # React components
│   ├── editor/           # TipTap editor components
│   ├── git/              # Git-related UI
│   ├── kanban/           # Kanban board components
│   ├── notes/            # Note management UI
│   ├── security/         # Auth/unlock screens
│   ├── settings/         # Settings UI
│   ├── templates/        # Template selection
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
│   ├── __tests__/       # Hook unit tests
│   └── testHelpers.ts   # Test utilities
├── lib/                  # Business logic & services
│   ├── crypto/          # Encryption services
│   ├── git/             # Git operations
│   ├── kanban/          # Kanban data models
│   ├── notes/           # Note services
│   ├── settings/        # Settings management
│   └── templates/       # Template system
├── context/             # React context providers
│   ├── RepoContext.tsx # Repository state
│   └── SettingsContext.tsx # App settings
└── docs/                # Documentation
```

## Data Flow

### Note Creation Flow

```
User Input (UI)
    ↓
useNoteCreation hook
    ↓
notesService.createNote()
    ↓
cryptoService.encrypt()
    ↓
File System API
    ↓
gitService.commitChanges()
```

### Note Loading Flow

```
Repository Selection (UI)
    ↓
useNotesLoading hook
    ↓
File System API (read)
    ↓
cryptoService.decrypt()
    ↓
notesService.parseNote()
    ↓
State Update (render)
```

## Key Components

### 1. Repository Management

**RepoContext** provides repository state globally:

```typescript
interface RepoContextType {
  repoPath: string | null;
  passphrase: string | null;
  isUnlocked: boolean;
  setRepo: (path: string, passphrase: string) => void;
  lockRepo: () => void;
}
```

### 2. Settings Management

**SettingsContext** manages application settings:

```typescript
interface SettingsContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
}
```

### 3. Editor System

**TipTap Editor** with custom extensions:

- StarterKit (basic formatting)
- Mention (note linking with @)
- CodeBlock (syntax highlighting)
- Highlight
- TaskList

### 4. Kanban System

**Drag-and-drop boards** with @dnd-kit:

- Multiple boards per repository
- Card mentions link to notes
- Column customization
- Drag-and-drop reordering

## Security Model

### Encryption

- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 (100,000 iterations)
- **Salt**: 16 bytes random per file
- **IV**: 12 bytes random per encryption

### Data Storage

- All notes encrypted at rest
- Passphrase never stored
- Passphrase kept in memory only
- Lock on inactivity (configurable)

### Git Integration

- Commits use encrypted content
- Commit messages in plaintext
- Auto-sync optional (disabled by default)

## Performance Optimizations

### 1. React.memo

All components wrapped with `memo()` to prevent unnecessary re-renders:

```typescript
export const Component = memo(function Component(props) {
  // ...
});
```

### 2. useCallback

Callbacks memoized for stable references:

```typescript
const handleAction = useCallback(() => {
  // Action logic
}, [dependencies]);
```

### 3. Lazy Loading

Components and editors loaded on demand:

```typescript
const Editor = dynamic(() => import('./TiptapEditor'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});
```

### 4. Debouncing

Auto-save and search debounced to reduce I/O:

```typescript
const debouncedSave = useCallback(
  debounce((content) => saveNote(content), 1000),
  []
);
```

## Testing Strategy

### Unit Tests

- All 22 custom hooks have comprehensive test coverage
- 176 total tests with 100% pass rate
- Mock providers for context dependencies
- Jest timers for async operations

### Test Structure

```typescript
describe('useFeature', () => {
  beforeEach(() => {
    // Setup mocks
  });

  it('should handle action', () => {
    const { result } = renderHook(() => useFeature(params));

    act(() => {
      result.current.handleAction();
    });

    expect(result.current.state).toBe(expectedState);
  });
});
```

## Deployment

### Local Development

```bash
pnpm dev          # Development server (Turbopack)
pnpm test         # Run tests
pnpm build        # Production build
pnpm start        # Production server
```

### Browser Requirements

- Chrome/Edge (File System Access API)
- Modern JavaScript (ES2020+)
- Local storage enabled

## Error Handling

### Layered Error Handling

```typescript
// Service layer - throw errors
export async function serviceMethod() {
  if (error) throw new Error('Descriptive message');
}

// Hook layer - catch and set error state
export function useFeature() {
  const [error, setError] = useState('');

  const handleAction = useCallback(async () => {
    try {
      await serviceMethod();
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  return { error };
}

// UI layer - display errors
export function Component() {
  const { error } = useFeature();

  return error ? <Alert>{error}</Alert> : <Content />;
}
```

## Future Considerations

### Scalability

- Large repositories (1000+ notes) may need indexing
- Search could benefit from full-text search library
- Consider web workers for crypto operations

### Feature Additions

- Multiple vault support
- Cloud sync (optional)
- Mobile app (React Native)
- Plugins/extensions system

### Refactoring Opportunities

- Extract more utility functions
- Consider state management library (Zustand, Jotai)
- Optimize bundle size with code splitting

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [TipTap Documentation](https://tiptap.dev)
- [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
