# KanbanBoard Refactoring Plan

## Current State Analysis

**File:** `components/kanban/KanbanBoard.tsx`
**Size:** 717 lines
**Complexity:** HIGH - God Component

### Issues
- **9 useState hooks** - State management scattered throughout
- **Complex drag-and-drop logic** (~150 lines) - Mixed with component
- **Card CRUD operations** (~100 lines) - Inline business logic
- **Column management** (~80 lines) - Inline business logic
- **Data loading** (~60 lines) - Multiple useEffects
- **No separation** between UI and business logic
- **Hard to test** - Everything coupled together
- **Hard to maintain** - Changes affect multiple concerns

---

## Refactoring Strategy

### Target: 717 lines → 100 lines (86% reduction)

---

## Phase 1: Extract Custom Hooks (400 lines extracted)

### 1.1 Create `hooks/useKanbanDragDrop.ts` (~150 lines)

**Purpose:** Manage all drag-and-drop state and logic

**Exports:**
```typescript
export function useKanbanDragDrop(board: KanbanBoardType, setBoard: (board: KanbanBoardType) => void) {
  const [activeCard, setActiveCard] = useState<KanbanCardType | null>(null);

  const sensors = useSensors(...);
  const handleDragStart = (event: DragStartEvent) => { ... };
  const handleDragOver = (event: DragOverEvent) => { ... };
  const handleDragEnd = (event: DragEndEvent) => { ... };

  return {
    activeCard,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
```

**Extracted from KanbanBoard.tsx:**
- Lines 51, 61-67 (activeCard state + sensors)
- Lines 69-75 (handleDragStart)
- Lines 77-125 (handleDragOver)
- Lines 127-173 (handleDragEnd)

---

### 1.2 Create `hooks/useKanbanCards.ts` (~100 lines)

**Purpose:** Card CRUD operations

**Exports:**
```typescript
export function useKanbanCards(board: KanbanBoardType, setBoard: (board: KanbanBoardType) => void) {
  const handleAddCard = (title: string, description: string | undefined, columnId: string) => { ... };
  const handleDeleteCard = (cardId: string) => { ... };
  const handleEditCard = (cardId: string, updates: Partial<KanbanCardType>) => { ... };

  return {
    handleAddCard,
    handleDeleteCard,
    handleEditCard,
  };
}
```

**Extracted from KanbanBoard.tsx:**
- Lines 175-201 (handleAddCard)
- Lines 203-217 (handleDeleteCard)
- Lines 219-242 (handleEditCard)

---

### 1.3 Create `hooks/useKanbanColumns.ts` (~80 lines)

**Purpose:** Column management operations

**Exports:**
```typescript
export function useKanbanColumns(board: KanbanBoardType, setBoard: (board: KanbanBoardType) => void) {
  const [editingColumns, setEditingColumns] = useState(board.columns);

  const handleAddColumn = (name: string, wipLimit?: number) => { ... };
  const handleDeleteColumn = (columnId: string) => { ... };
  const handleUpdateColumn = (columnId: string, updates: Partial<KanbanColumn>) => { ... };
  const handleSaveColumns = () => { ... };

  return {
    editingColumns,
    setEditingColumns,
    handleAddColumn,
    handleDeleteColumn,
    handleUpdateColumn,
    handleSaveColumns,
  };
}
```

**Extracted from KanbanBoard.tsx:**
- Lines 57, 244-251 (editingColumns state)
- Lines 253-270 (handleAddColumn)
- Lines 272-288 (handleDeleteColumn)
- Lines 290-307 (handleUpdateColumn)
- Lines 309-318 (handleSaveColumns)

---

### 1.4 Create `hooks/useKanbanData.ts` (~60 lines)

**Purpose:** Board data loading and synchronization

**Exports:**
```typescript
export function useKanbanData(
  boardId: string,
  repoPath: string | null,
  syncTrigger?: number
) {
  const [board, setBoard] = useState<KanbanBoardType>(createDefaultBoard());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadBoard = async () => { ... };
  const saveBoard = async () => { ... };
  const syncTasksToBoard = async () => { ... };

  // Auto-load on mount
  useEffect(() => { loadBoard(); }, [boardId, repoPath]);

  // Auto-save on board changes (debounced)
  useEffect(() => { ... }, [board]);

  // Sync tasks when trigger changes
  useEffect(() => { ... }, [syncTrigger]);

  return {
    board,
    setBoard,
    isSyncing,
    isLoaded,
    loadBoard,
    saveBoard,
    syncTasksToBoard,
  };
}
```

**Extracted from KanbanBoard.tsx:**
- Lines 50, 58-59 (board, isSyncing, isLoaded state)
- Lines 320-358 (loadBoard)
- Lines 360-387 (saveBoard - auto-save useEffect)
- Lines 389-435 (syncTasksToBoard - sync useEffect)

---

## Phase 2: Extract UI Components (267 lines extracted)

### 2.1 Create `components/kanban/KanbanAddCardDialog.tsx` (~60 lines)

**Purpose:** Dialog for adding new cards

**Props:**
```typescript
interface KanbanAddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCard: (title: string, description: string | undefined, columnId: string) => void;
  columns: KanbanColumn[];
}
```

**Extracted from KanbanBoard.tsx:**
- Lines 52-54 (newCardTitle, newCardDescription, newCardColumn state)
- Lines 55 (isDialogOpen state)
- Lines 437-518 (Dialog UI)

---

### 2.2 Create `components/kanban/KanbanColumnSettings.tsx` (~80 lines)

**Purpose:** Dialog for managing columns

**Props:**
```typescript
interface KanbanColumnSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: KanbanColumn[];
  editingColumns: KanbanColumn[];
  onEditingColumnsChange: (columns: KanbanColumn[]) => void;
  onSave: () => void;
  onAddColumn: () => void;
  onDeleteColumn: (columnId: string) => void;
  onUpdateColumn: (columnId: string, updates: Partial<KanbanColumn>) => void;
}
```

**Extracted from KanbanBoard.tsx:**
- Lines 56 (isSettingsOpen state)
- Lines 520-631 (Settings Dialog UI)

---

### 2.3 Create `components/kanban/KanbanBoardView.tsx` (~127 lines)

**Purpose:** Main board UI with DndContext

**Props:**
```typescript
interface KanbanBoardViewProps {
  board: KanbanBoardType;
  activeCard: KanbanCardType | null;
  sensors: SensorDescriptor<SensorOptions>[];
  onDragStart: (event: DragStartEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDeleteCard: (cardId: string) => void;
  onEditCard: (cardId: string, updates: Partial<KanbanCardType>) => void;
  onOpenAddCardDialog: () => void;
  onOpenSettings: () => void;
  onSync: () => void;
  isSyncing: boolean;
}
```

**Extracted from KanbanBoard.tsx:**
- Lines 633-717 (Main board UI with columns)

---

## Phase 3: Refactored KanbanBoard.tsx (~100 lines)

**New structure:**

```typescript
"use client";

import { useState } from "react";
import { useRepo } from "@/contexts/RepoContext";
import { useKanbanData } from "@/hooks/useKanbanData";
import { useKanbanDragDrop } from "@/hooks/useKanbanDragDrop";
import { useKanbanCards } from "@/hooks/useKanbanCards";
import { useKanbanColumns } from "@/hooks/useKanbanColumns";
import { KanbanBoardView } from "./KanbanBoardView";
import { KanbanAddCardDialog } from "./KanbanAddCardDialog";
import { KanbanColumnSettings } from "./KanbanColumnSettings";

interface KanbanBoardProps {
  boardId: string;
  onBoardUpdate?: () => void;
  syncTrigger?: number;
}

export function KanbanBoard({ boardId, onBoardUpdate, syncTrigger }: KanbanBoardProps) {
  const { repoPath } = useRepo();

  // Data management
  const {
    board,
    setBoard,
    isSyncing,
    isLoaded,
    syncTasksToBoard,
  } = useKanbanData(boardId, repoPath, syncTrigger);

  // Drag and drop
  const {
    activeCard,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useKanbanDragDrop(board, setBoard);

  // Card operations
  const {
    handleAddCard,
    handleDeleteCard,
    handleEditCard,
  } = useKanbanCards(board, setBoard);

  // Column operations
  const {
    editingColumns,
    setEditingColumns,
    handleSaveColumns,
  } = useKanbanColumns(board, setBoard);

  // Dialog state
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (!isLoaded) {
    return <div>Loading board...</div>;
  }

  return (
    <>
      <KanbanBoardView
        board={board}
        activeCard={activeCard}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDeleteCard={handleDeleteCard}
        onEditCard={handleEditCard}
        onOpenAddCardDialog={() => setIsAddCardDialogOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSync={syncTasksToBoard}
        isSyncing={isSyncing}
      />

      <KanbanAddCardDialog
        open={isAddCardDialogOpen}
        onOpenChange={setIsAddCardDialogOpen}
        onAddCard={handleAddCard}
        columns={board.columns}
      />

      <KanbanColumnSettings
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        columns={board.columns}
        editingColumns={editingColumns}
        onEditingColumnsChange={setEditingColumns}
        onSave={handleSaveColumns}
      />
    </>
  );
}
```

---

## Implementation Checklist

### Phase 1: Hooks (Priority 1)
- [ ] Create `hooks/useKanbanData.ts`
- [ ] Create `hooks/useKanbanDragDrop.ts`
- [ ] Create `hooks/useKanbanCards.ts`
- [ ] Create `hooks/useKanbanColumns.ts`
- [ ] Test each hook in isolation

### Phase 2: Components (Priority 2)
- [ ] Create `components/kanban/KanbanBoardView.tsx`
- [ ] Create `components/kanban/KanbanAddCardDialog.tsx`
- [ ] Create `components/kanban/KanbanColumnSettings.tsx`
- [ ] Add React.memo to all components

### Phase 3: Integration (Priority 3)
- [ ] Refactor `KanbanBoard.tsx` to use hooks + components
- [ ] Test drag and drop functionality
- [ ] Test card CRUD operations
- [ ] Test column management
- [ ] Test board sync
- [ ] Verify all 73+ tests pass

### Phase 4: Optimization (Priority 4)
- [ ] Add useCallback to all event handlers
- [ ] Profile render performance
- [ ] Optimize re-renders with memo
- [ ] Add loading states
- [ ] Add error boundaries

---

## Testing Strategy

### Unit Tests
- Test each hook independently
- Test card CRUD logic
- Test column management logic
- Test drag-and-drop logic

### Integration Tests
- Test hook composition in KanbanBoard
- Test dialog workflows
- Test sync functionality

### E2E Tests
- Test full user workflows
- Test drag-and-drop visually
- Test data persistence

---

## Estimated Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Lines in KanbanBoard.tsx** | 717 | 100 | 86% reduction |
| **Number of hooks** | 9 | 5 (from custom hooks) | Cleaner composition |
| **State co-location** | Mixed | Separated by concern | Better organization |
| **Testability** | Low | High | Isolated units |
| **Maintainability** | Low | High | Single responsibility |

---

## Success Criteria

✅ KanbanBoard.tsx reduced to ~100 lines
✅ All business logic extracted to hooks
✅ All complex UI extracted to components
✅ All tests passing
✅ No performance regressions
✅ Drag-and-drop works perfectly
✅ All features functional

---

## Timeline

- **Week 1 Day 1-2:** Create all hooks
- **Week 1 Day 3-4:** Create all components
- **Week 1 Day 5:** Integrate and test
- **Week 2:** Polish, optimize, document

---

*Follow this plan systematically. Test at each phase. Commit atomically.*
