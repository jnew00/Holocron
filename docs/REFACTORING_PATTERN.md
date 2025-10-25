# Refactoring Pattern Guide

## Overview

This guide documents the systematic refactoring pattern used to transform 17 large components in Holocron from monolithic structures to composable, maintainable pieces. The pattern achieves 40-72% size reduction while improving testability and maintainability.

## The Pattern

### Step 1: Identify Refactoring Candidates

Look for components with these characteristics:

- **Size**: 100+ lines of code
- **Complexity**: Multiple responsibilities (UI + logic + state)
- **Testing**: Difficult to test in isolation
- **Maintenance**: Frequent changes needed

### Step 2: Analyze Component Structure

Break down the component into:

1. **State Management**: useState, useEffect hooks
2. **Event Handlers**: Callbacks and user interactions
3. **Data Fetching**: API calls, file system operations
4. **UI Rendering**: JSX structure and presentation

### Step 3: Extract Custom Hooks

Create hooks for business logic:

```typescript
// Before: Logic embedded in component
export function Component() {
  const [state, setState] = useState(initial);
  const [loading, setLoading] = useState(false);

  const handleAction = useCallback(async () => {
    setLoading(true);
    try {
      // Complex business logic
      const result = await service.method();
      setState(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dependencies]);

  return <UI />;
}

// After: Logic in custom hook
export function useFeature(params): UseFeatureReturn {
  const [state, setState] = useState(initial);
  const [loading, setLoading] = useState(false);

  const handleAction = useCallback(async () => {
    setLoading(true);
    try {
      const result = await service.method();
      setState(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dependencies]);

  return { state, loading, handleAction };
}

// Component becomes simpler
export const Component = memo(function Component(params) {
  const hookState = useFeature(params);

  return <UI {...hookState} />;
});
```

### Step 4: Extract Presentational Components

Create small, focused UI components:

```typescript
// Before: Monolithic JSX
export function Component() {
  return (
    <div>
      <div className="complex">
        <label>Field 1</label>
        <input value={value1} onChange={handler1} />
      </div>
      <div className="complex">
        <label>Field 2</label>
        <input value={value2} onChange={handler2} />
      </div>
      {/* 50+ more lines of JSX */}
    </div>
  );
}

// After: Extracted components
interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const FormField = memo(function FormField({
  label,
  value,
  onChange,
}: FormFieldProps) {
  return (
    <div className="complex">
      <label>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
});

export const Component = memo(function Component() {
  const { value1, value2, handler1, handler2 } = useFormState();

  return (
    <div>
      <FormField label="Field 1" value={value1} onChange={handler1} />
      <FormField label="Field 2" value={value2} onChange={handler2} />
    </div>
  );
});
```

### Step 5: Extract Utility Functions

Move pure logic to utility files:

```typescript
// Before: Helper functions inside component
export function Component() {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US').format(date);
  };

  const calculateAge = (birthDate: Date) => {
    const diff = Date.now() - birthDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  };

  // Component logic...
}

// After: Utilities in separate file
// utils/dateHelpers.ts
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US').format(date);
}

export function calculateAge(birthDate: Date): number {
  const diff = Date.now() - birthDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
}

// Component.tsx
import { formatDate, calculateAge } from '@/utils/dateHelpers';

export const Component = memo(function Component() {
  // Component logic...
});
```

### Step 6: Apply React.memo

Wrap all components with `memo()`:

```typescript
export const Component = memo(function Component(props: Props) {
  // Component logic...
});
```

### Step 7: Stabilize Callbacks

Use `useCallback` for all event handlers:

```typescript
const handleAction = useCallback(
  (param: string) => {
    // Handler logic
  },
  [dependencies]
);
```

### Step 8: Define TypeScript Interfaces

Create clear interfaces for props and return types:

```typescript
interface UseFeatureParams {
  required: string;
  optional?: number;
}

interface UseFeatureReturn {
  state: StateType;
  loading: boolean;
  handleAction: () => void;
}

export function useFeature(params: UseFeatureParams): UseFeatureReturn {
  // Hook implementation
}
```

## Real-World Examples

### Example 1: KanbanAddCardDialog

**Before** (111 lines):
```typescript
export function KanbanAddCardDialog({
  open,
  onOpenChange,
  onAddCard,
  columns,
}: KanbanAddCardDialogProps) {
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [newCardColumn, setNewCardColumn] = useState(columns[0]?.id || "todo");

  const handleAddCard = useCallback(() => {
    if (!newCardTitle.trim()) return;
    onAddCard(newCardTitle, newCardDescription || undefined, newCardColumn);
    setNewCardTitle("");
    setNewCardDescription("");
    onOpenChange(false);
  }, [newCardTitle, newCardDescription, newCardColumn, onAddCard, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 80+ lines of JSX */}
    </Dialog>
  );
}
```

**After** (80 lines, -28%):

```typescript
// hooks/useAddCard.ts (54 lines)
export function useAddCard({
  onAddCard,
  onOpenChange,
  columns,
}: UseAddCardParams): UseAddCardReturn {
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [newCardColumn, setNewCardColumn] = useState(columns[0]?.id || "todo");

  const handleAddCard = useCallback(() => {
    if (!newCardTitle.trim()) return;
    onAddCard(newCardTitle, newCardDescription || undefined, newCardColumn);
    setNewCardTitle("");
    setNewCardDescription("");
    onOpenChange(false);
  }, [newCardTitle, newCardDescription, newCardColumn, onAddCard, onOpenChange]);

  return {
    newCardTitle,
    setNewCardTitle,
    newCardDescription,
    setNewCardDescription,
    newCardColumn,
    setNewCardColumn,
    handleAddCard,
  };
}

// components/kanban/AddCardForm.tsx (68 lines)
export const AddCardForm = memo(function AddCardForm({
  newCardTitle,
  setNewCardTitle,
  newCardDescription,
  setNewCardDescription,
  newCardColumn,
  setNewCardColumn,
  columns,
}: AddCardFormProps) {
  return (
    <div className="space-y-4">
      <FormField label="Title" value={newCardTitle} onChange={setNewCardTitle} />
      <FormField label="Description" value={newCardDescription} onChange={setNewCardDescription} />
      <ColumnSelect value={newCardColumn} onChange={setNewCardColumn} columns={columns} />
    </div>
  );
});

// components/kanban/KanbanAddCardDialog.tsx (80 lines)
export const KanbanAddCardDialog = memo(function KanbanAddCardDialog({
  open,
  onOpenChange,
  onAddCard,
  columns,
}: KanbanAddCardDialogProps) {
  const formState = useAddCard({ onAddCard, onOpenChange, columns });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
        </DialogHeader>
        <AddCardForm {...formState} columns={columns} />
        <DialogFooter>
          <Button onClick={formState.handleAddCard}>Add Card</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
```

**Results**:
- Main component: 111 → 80 lines (-28%)
- Created: 1 hook, 1 form component
- Testability: Hook can be tested independently
- Reusability: AddCardForm can be used elsewhere

### Example 2: TiptapEditor

**Before** (363 lines):
- Massive component with editor configuration, extensions, mentions, toolbar
- All logic embedded in one file
- Difficult to test individual features

**After** (135 lines, -63%):
- Created 4 custom hooks: useEditorSetup, useEditorSync, useMentionConfig, useAutoSave
- Created 3 components: EditorToolbar, MentionList, CodeBlockComponent
- Created 1 utility: editorExtensions.ts
- Each piece testable in isolation

**Files created**:
- `hooks/useEditorSetup.ts` - Editor initialization
- `hooks/useEditorSync.ts` - Content synchronization
- `hooks/useMentionConfig.ts` - Mention extension config
- `hooks/useAutoSave.ts` - Auto-save functionality
- `components/editor/EditorToolbar.tsx` - Formatting toolbar
- `components/editor/MentionList.tsx` - Mention suggestions
- `components/editor/CodeBlockComponent.tsx` - Code blocks
- `lib/editor/editorExtensions.ts` - TipTap extensions

## Checklist

Use this checklist when refactoring a component:

### Analysis Phase
- [ ] Component is 100+ lines
- [ ] Multiple responsibilities identified
- [ ] Business logic mixed with UI
- [ ] Difficult to test in current state

### Extraction Phase
- [ ] Custom hooks created for business logic
- [ ] Presentational components extracted
- [ ] Utility functions moved to separate files
- [ ] Type interfaces defined

### Optimization Phase
- [ ] React.memo applied to all components
- [ ] useCallback applied to event handlers
- [ ] Dependency arrays optimized
- [ ] Props properly typed

### Testing Phase
- [ ] Hook tests created
- [ ] Component tests updated
- [ ] All tests passing
- [ ] Coverage maintained or improved

### Documentation Phase
- [ ] Hook documented with TSDoc
- [ ] Component props documented
- [ ] Examples provided
- [ ] README updated

## Metrics

Track these metrics to measure refactoring success:

### Code Size
- **Before**: Total lines in monolithic component
- **After**: Total lines across all new files
- **Target**: 30-50% reduction in main component

### Testability
- **Before**: Number of tests (usually 0-2)
- **After**: Number of tests (aim for 6-10 per hook)
- **Target**: 8+ tests per hook

### Complexity
- **Before**: Cyclomatic complexity
- **After**: Cyclomatic complexity
- **Target**: Complexity < 10 per function

### Reusability
- **Before**: Code duplication count
- **After**: Code duplication count
- **Target**: 0 duplicated logic blocks

## Results from Holocron Refactoring

### Overall Statistics
- **Components refactored**: 17
- **Lines reduced**: 5,343 → 1,507 (-72%)
- **Hooks created**: 22
- **Components created**: 46
- **Utility files created**: 3
- **Tests created**: 176 (100% pass rate)

### Top Refactorings by Impact

| Component | Before | After | Reduction |
|-----------|--------|-------|-----------|
| TiptapEditor | 363 | 135 | 63% |
| NotesSidebar | 282 | 113 | 60% |
| TemplateManager | 207 | 93 | 55% |
| AutoSyncManager | 184 | 87 | 53% |
| GitSync | 282 | 121 | 57% |

## Common Pitfalls

### Pitfall 1: Over-extraction
**Problem**: Creating too many tiny hooks/components
**Solution**: Only extract when it improves clarity or reusability

### Pitfall 2: Broken Dependencies
**Problem**: Missing dependencies in useCallback/useEffect
**Solution**: Use ESLint react-hooks plugin

### Pitfall 3: Prop Drilling
**Problem**: Passing props through many layers
**Solution**: Use Context or composition patterns

### Pitfall 4: Premature Optimization
**Problem**: Applying memo() everywhere without measuring
**Solution**: Profile first, optimize hot paths only

### Pitfall 5: Lost Context
**Problem**: Extracted hooks can't access context
**Solution**: Pass context values as hook parameters

## When NOT to Refactor

Don't refactor when:

1. **Component is small** (< 100 lines) and clear
2. **One-off use case** with no reusability potential
3. **Deadline pressure** - refactor during cleanup phase
4. **Working code** without maintenance issues
5. **No tests** - write tests first, then refactor

## Tools and Techniques

### Code Analysis
```bash
# Count lines in a file
wc -l components/MyComponent.tsx

# Find large files
find components -name "*.tsx" -exec wc -l {} \; | sort -rn | head -10

# Check complexity
npx ts-complexity components/MyComponent.tsx
```

### Testing
```bash
# Run tests for specific hook
pnpm test useFeature

# Run tests with coverage
pnpm test --coverage

# Watch mode for TDD
pnpm test --watch
```

### Type Checking
```bash
# Check types
pnpm tsc --noEmit

# Find any types
grep -r "any" hooks/

# Generate type coverage report
npx type-coverage
```

## Next Steps

After refactoring:

1. **Update documentation** - Document new hooks and components
2. **Create examples** - Show how to use extracted pieces
3. **Monitor performance** - Check for regressions
4. **Gather feedback** - Share with team
5. **Iterate** - Refine based on usage

## References

- [React Hooks Documentation](https://react.dev/reference/react)
- [Kent C. Dodds - When to useMemo and useCallback](https://kentcdodds.com/blog/usememo-and-usecallback)
- [Patterns.dev - React Patterns](https://www.patterns.dev/react)
- [Martin Fowler - Refactoring](https://refactoring.com/)
