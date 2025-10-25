# Hooks API Documentation

## Overview

This document provides complete API documentation for all 22 custom React hooks in Holocron. Each hook follows consistent patterns for parameters, return values, and TypeScript typing.

## Table of Contents

### Editor Hooks
- [useEditorSetup](#useeditorsetup)
- [useEditorSync](#useeditorsync)
- [useMentionConfig](#usementionconfig)
- [useAutoSave](#useautosave)
- [useCodeBlockTheme](#usecodeblocktheme)

### Git Hooks
- [useGitSync](#usegitsync)
- [useAutoSync](#useautosync)

### Kanban Hooks
- [useKanbanBoard](#usekanbanboard)
- [useKanbanCard](#usekanbancard)
- [useKanbanColumns](#usekanbancolumns)
- [useKanbanMentionList](#usekanbanmentionlist)
- [useKanbanSync](#usekanbansync)
- [useBoardOperations](#useboardoperations)
- [useAddCard](#useaddcard)

### Notes Hooks
- [useNotesSidebar](#usenotessidebar)
- [useNoteCreation](#usenotecreation)

### Settings Hooks
- [useSettingsForm](#usesettingsform)

### Template Hooks
- [useTemplateManager](#usetemplatemanager)
- [useTemplateSelector](#usetemplateselector)

### Security Hooks
- [useUnlock](#useunlock)

### Toolbar Hooks
- [useEditorToolbar](#useeditortoolbar)
- [useToolbarActions](#usetoolbaractions)

---

## Editor Hooks

### useEditorSetup

Sets up and initializes a TipTap editor instance with configured extensions.

#### Parameters

```typescript
interface UseEditorSetupParams {
  content: string;
  onUpdate: (content: string) => void;
  editable: boolean;
  mentionConfig: SuggestionOptions;
}
```

- `content` (string): Initial editor content
- `onUpdate` (function): Callback when content changes
- `editable` (boolean): Whether editor is editable
- `mentionConfig` (SuggestionOptions): Configuration for mention extension

#### Returns

```typescript
interface UseEditorSetupReturn {
  editor: Editor | null;
}
```

- `editor` (Editor | null): TipTap editor instance

#### Example

```typescript
const { editor } = useEditorSetup({
  content: initialContent,
  onUpdate: handleContentChange,
  editable: true,
  mentionConfig: {
    items: ({ query }) => getSuggestions(query),
    render: () => ({ component: MentionList }),
  },
});
```

---

### useEditorSync

Synchronizes external content changes with the editor instance.

#### Parameters

```typescript
interface UseEditorSyncParams {
  editor: Editor | null;
  content: string;
  noteId: string;
}
```

- `editor` (Editor | null): TipTap editor instance
- `content` (string): External content to sync
- `noteId` (string): Current note ID

#### Returns

```typescript
interface UseEditorSyncReturn {
  lastNoteId: React.MutableRefObject<string>;
}
```

- `lastNoteId` (ref): Reference to last synced note ID

#### Example

```typescript
const { lastNoteId } = useEditorSync({
  editor,
  content: noteContent,
  noteId: currentNoteId,
});
```

---

### useMentionConfig

Configures the mention (@) extension for linking notes.

#### Parameters

```typescript
interface UseMentionConfigParams {
  notes: NoteMetadata[];
  onMentionSelect: (noteId: string) => void;
}
```

- `notes` (NoteMetadata[]): Available notes for mentions
- `onMentionSelect` (function): Callback when mention is selected

#### Returns

```typescript
interface UseMentionConfigReturn {
  mentionConfig: SuggestionOptions;
}
```

- `mentionConfig` (SuggestionOptions): TipTap mention configuration

#### Example

```typescript
const { mentionConfig } = useMentionConfig({
  notes: allNotes,
  onMentionSelect: (noteId) => openNote(noteId),
});
```

---

### useAutoSave

Manages automatic saving of editor content with debouncing.

#### Parameters

```typescript
interface UseAutoSaveParams {
  content: string;
  noteId: string;
  onSave: (content: string) => Promise<void>;
  delay?: number;
}
```

- `content` (string): Current editor content
- `noteId` (string): Note being edited
- `onSave` (function): Save function
- `delay` (number, optional): Debounce delay in ms (default: 1000)

#### Returns

```typescript
interface UseAutoSaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
}
```

- `isSaving` (boolean): Whether save is in progress
- `lastSaved` (Date | null): Timestamp of last save

#### Example

```typescript
const { isSaving, lastSaved } = useAutoSave({
  content: editorContent,
  noteId: currentNote.id,
  onSave: saveNoteContent,
  delay: 2000,
});
```

---

### useCodeBlockTheme

Manages theme for syntax-highlighted code blocks.

#### Parameters

```typescript
interface UseCodeBlockThemeParams {
  isDarkMode: boolean;
}
```

- `isDarkMode` (boolean): Whether dark mode is active

#### Returns

```typescript
interface UseCodeBlockThemeReturn {
  theme: 'light' | 'dark';
  updateTheme: () => void;
}
```

- `theme` (string): Current theme name
- `updateTheme` (function): Function to toggle theme

#### Example

```typescript
const { theme, updateTheme } = useCodeBlockTheme({
  isDarkMode: settings.theme === 'dark',
});
```

---

## Git Hooks

### useGitSync

Manages Git synchronization operations (commit and sync).

#### Parameters

```typescript
interface UseGitSyncParams {
  activeTab: 'notes' | 'kanban';
  onSync: () => void;
}
```

- `activeTab` (string): Current active tab
- `onSync` (function): Callback after sync completes

#### Returns

```typescript
interface UseGitSyncReturn {
  commitMessage: string;
  setCommitMessage: (message: string) => void;
  syncing: boolean;
  error: string;
  handleCommit: () => Promise<void>;
  handleSync: () => Promise<void>;
}
```

- `commitMessage` (string): Current commit message
- `setCommitMessage` (function): Update commit message
- `syncing` (boolean): Whether sync is in progress
- `error` (string): Error message if sync fails
- `handleCommit` (function): Commit changes
- `handleSync` (function): Pull and push changes

#### Example

```typescript
const {
  commitMessage,
  setCommitMessage,
  syncing,
  handleCommit,
  handleSync,
} = useGitSync({
  activeTab: 'notes',
  onSync: refreshNotes,
});
```

---

### useAutoSync

Manages automatic Git synchronization on an interval.

#### Parameters

```typescript
interface UseAutoSyncParams {
  enabled: boolean;
  interval: number;
  repoPath: string | null;
  passphrase: string | null;
  isUnlocked: boolean;
}
```

- `enabled` (boolean): Whether auto-sync is enabled
- `interval` (number): Sync interval in seconds
- `repoPath` (string | null): Repository path
- `passphrase` (string | null): Encryption passphrase
- `isUnlocked` (boolean): Whether repo is unlocked

#### Returns

```typescript
interface UseAutoSyncReturn {
  lastSync: Date | null;
  nextSync: Date | null;
}
```

- `lastSync` (Date | null): Timestamp of last sync
- `nextSync` (Date | null): Timestamp of next scheduled sync

#### Example

```typescript
const { lastSync, nextSync } = useAutoSync({
  enabled: settings.autoSync,
  interval: settings.autoSyncInterval,
  repoPath,
  passphrase,
  isUnlocked,
});
```

---

## Kanban Hooks

### useKanbanBoard

Manages kanban board state and operations.

#### Parameters

```typescript
interface UseKanbanBoardParams {
  dirHandle: FileSystemDirectoryHandle | null;
  passphrase: string | null;
  boardId: string | null;
}
```

- `dirHandle` (FileSystemDirectoryHandle | null): File system handle
- `passphrase` (string | null): Encryption passphrase
- `boardId` (string | null): Current board ID

#### Returns

```typescript
interface UseKanbanBoardReturn {
  board: KanbanBoard | null;
  loading: boolean;
  error: string;
  refreshBoard: () => Promise<void>;
  updateBoard: (updates: Partial<KanbanBoard>) => Promise<void>;
}
```

- `board` (KanbanBoard | null): Current board data
- `loading` (boolean): Whether board is loading
- `error` (string): Error message if loading fails
- `refreshBoard` (function): Reload board from disk
- `updateBoard` (function): Update board and save

#### Example

```typescript
const { board, loading, updateBoard } = useKanbanBoard({
  dirHandle,
  passphrase,
  boardId: selectedBoardId,
});
```

---

### useKanbanCard

Manages individual kanban card operations.

#### Parameters

```typescript
interface UseKanbanCardParams {
  card: KanbanCard;
  onUpdate: (cardId: string, updates: Partial<KanbanCard>) => void;
  onDelete: (cardId: string) => void;
}
```

- `card` (KanbanCard): Card data
- `onUpdate` (function): Update card callback
- `onDelete` (function): Delete card callback

#### Returns

```typescript
interface UseKanbanCardReturn {
  isEditing: boolean;
  editedTitle: string;
  editedDescription: string;
  setEditedTitle: (title: string) => void;
  setEditedDescription: (description: string) => void;
  handleStartEdit: () => void;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
  handleDelete: () => void;
}
```

- `isEditing` (boolean): Whether card is in edit mode
- `editedTitle` (string): Title being edited
- `editedDescription` (string): Description being edited
- `setEditedTitle` (function): Update edited title
- `setEditedDescription` (function): Update edited description
- `handleStartEdit` (function): Enter edit mode
- `handleSaveEdit` (function): Save edits
- `handleCancelEdit` (function): Cancel edits
- `handleDelete` (function): Delete card

#### Example

```typescript
const {
  isEditing,
  editedTitle,
  handleStartEdit,
  handleSaveEdit,
  handleDelete,
} = useKanbanCard({
  card: cardData,
  onUpdate: updateCardOnBoard,
  onDelete: removeCardFromBoard,
});
```

---

### useKanbanColumns

Manages kanban column editing and reordering.

#### Parameters

```typescript
interface UseKanbanColumnsParams {
  board: KanbanBoard;
  onUpdate: (updates: Partial<KanbanBoard>) => void;
}
```

- `board` (KanbanBoard): Current board
- `onUpdate` (function): Update board callback

#### Returns

```typescript
interface UseKanbanColumnsReturn {
  editingColumns: KanbanColumn[];
  setEditingColumns: (columns: KanbanColumn[]) => void;
  handleAddColumn: () => void;
  handleRemoveColumn: (columnId: string) => void;
  handleColumnChange: (columnId: string, field: string, value: string) => void;
  handleSaveColumns: () => void;
}
```

- `editingColumns` (KanbanColumn[]): Columns being edited
- `setEditingColumns` (function): Update editing columns
- `handleAddColumn` (function): Add new column
- `handleRemoveColumn` (function): Remove column
- `handleColumnChange` (function): Update column field
- `handleSaveColumns` (function): Save column changes

#### Example

```typescript
const {
  editingColumns,
  handleAddColumn,
  handleRemoveColumn,
  handleColumnChange,
  handleSaveColumns,
} = useKanbanColumns({
  board: currentBoard,
  onUpdate: updateBoard,
});
```

---

### useKanbanMentionList

Manages keyboard navigation for kanban mention suggestions.

#### Parameters

```typescript
interface UseKanbanMentionListParams {
  items: Array<{ id: string; label: string }>;
  command: (item: { id: string }) => void;
  ref: React.RefObject<HTMLDivElement>;
}
```

- `items` (Array): Available mention items
- `command` (function): Function to execute when item selected
- `ref` (RefObject): Ref to mention list container

#### Returns

```typescript
interface UseKanbanMentionListReturn {
  selectedIndex: number;
  selectItem: (index: number) => void;
  upHandler: () => void;
  downHandler: () => void;
  enterHandler: () => void;
}
```

- `selectedIndex` (number): Currently selected index
- `selectItem` (function): Select item by index
- `upHandler` (function): Navigate up
- `downHandler` (function): Navigate down
- `enterHandler` (function): Select current item

#### Example

```typescript
const {
  selectedIndex,
  upHandler,
  downHandler,
  enterHandler,
} = useKanbanMentionList({
  items: noteItems,
  command: insertMention,
  ref: listRef,
});
```

---

### useKanbanSync

Manages kanban board Git synchronization.

#### Parameters

```typescript
interface UseKanbanSyncParams {
  activeTab: string;
  onSync: () => void;
}
```

- `activeTab` (string): Current active tab
- `onSync` (function): Callback after sync

#### Returns

```typescript
interface UseKanbanSyncReturn {
  commitMessage: string;
  setCommitMessage: (message: string) => void;
  syncing: boolean;
  error: string;
  handleCommit: () => Promise<void>;
  handleSync: () => Promise<void>;
}
```

Same return structure as [useGitSync](#usegitsync).

#### Example

```typescript
const { handleCommit, handleSync, syncing } = useKanbanSync({
  activeTab: 'kanban',
  onSync: refreshBoards,
});
```

---

### useBoardOperations

Manages kanban board creation, deletion, and form state.

#### Parameters

```typescript
interface UseBoardOperationsParams {
  dirHandle: FileSystemDirectoryHandle | null;
  passphrase: string | null;
  onBoardCreated: () => void;
}
```

- `dirHandle` (FileSystemDirectoryHandle | null): File system handle
- `passphrase` (string | null): Encryption passphrase
- `onBoardCreated` (function): Callback after board created

#### Returns

```typescript
interface UseBoardOperationsReturn {
  newBoardName: string;
  setNewBoardName: (name: string) => void;
  newBoardIcon: string;
  setNewBoardIcon: (icon: string) => void;
  creating: boolean;
  error: string;
  handleCreateBoard: () => Promise<void>;
  handleDeleteBoard: (boardId: string) => Promise<void>;
}
```

- `newBoardName` (string): New board name
- `setNewBoardName` (function): Update board name
- `newBoardIcon` (string): New board icon
- `setNewBoardIcon` (function): Update board icon
- `creating` (boolean): Whether create is in progress
- `error` (string): Error message
- `handleCreateBoard` (function): Create new board
- `handleDeleteBoard` (function): Delete board

#### Example

```typescript
const {
  newBoardName,
  setNewBoardName,
  newBoardIcon,
  setNewBoardIcon,
  handleCreateBoard,
  handleDeleteBoard,
} = useBoardOperations({
  dirHandle,
  passphrase,
  onBoardCreated: refreshBoardList,
});
```

---

### useAddCard

Manages add card form state and logic.

#### Parameters

```typescript
interface UseAddCardParams {
  onAddCard: (title: string, description: string | undefined, columnId: string) => void;
  onOpenChange: (open: boolean) => void;
  columns: KanbanBoard["columns"];
}
```

- `onAddCard` (function): Callback to add card
- `onOpenChange` (function): Callback to control dialog open state
- `columns` (Array): Available columns

#### Returns

```typescript
interface UseAddCardReturn {
  newCardTitle: string;
  setNewCardTitle: (value: string) => void;
  newCardDescription: string;
  setNewCardDescription: (value: string) => void;
  newCardColumn: string;
  setNewCardColumn: (value: string) => void;
  handleAddCard: () => void;
}
```

- `newCardTitle` (string): Card title
- `setNewCardTitle` (function): Update title
- `newCardDescription` (string): Card description
- `setNewCardDescription` (function): Update description
- `newCardColumn` (string): Selected column ID
- `setNewCardColumn` (function): Update column
- `handleAddCard` (function): Add card and reset form

#### Example

```typescript
const {
  newCardTitle,
  setNewCardTitle,
  newCardDescription,
  setNewCardDescription,
  newCardColumn,
  setNewCardColumn,
  handleAddCard,
} = useAddCard({
  onAddCard: addCardToBoard,
  onOpenChange: setDialogOpen,
  columns: board.columns,
});
```

---

## Notes Hooks

### useNotesSidebar

Manages notes sidebar state, search, filtering, and operations.

#### Parameters

```typescript
interface UseNotesSidebarParams {
  repoPath: string | null;
  onSelectNote: (note: NoteMetadata) => void;
  onDeleteNote: (noteId: string) => Promise<void>;
  onArchiveNote: (noteId: string) => Promise<void>;
  refreshTrigger: number;
}
```

- `repoPath` (string | null): Repository path
- `onSelectNote` (function): Callback when note selected
- `onDeleteNote` (function): Delete note callback
- `onArchiveNote` (function): Archive note callback
- `refreshTrigger` (number): Increment to trigger refresh

#### Returns

```typescript
interface UseNotesSidebarReturn {
  notes: NoteMetadata[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  filteredNotes: NoteMetadata[];
  handleDeleteNote: (noteId: string) => Promise<void>;
  handleArchiveNote: (noteId: string) => Promise<void>;
}
```

- `notes` (NoteMetadata[]): All notes
- `loading` (boolean): Whether notes are loading
- `searchQuery` (string): Current search query
- `setSearchQuery` (function): Update search query
- `showArchived` (boolean): Whether to show archived notes
- `setShowArchived` (function): Toggle archived notes
- `filteredNotes` (NoteMetadata[]): Notes after filtering
- `handleDeleteNote` (function): Delete note handler
- `handleArchiveNote` (function): Archive note handler

#### Example

```typescript
const {
  filteredNotes,
  loading,
  searchQuery,
  setSearchQuery,
  handleDeleteNote,
} = useNotesSidebar({
  repoPath,
  onSelectNote: openNote,
  onDeleteNote: deleteNoteService,
  onArchiveNote: archiveNoteService,
  refreshTrigger,
});
```

---

### useNoteCreation

Manages note creation form and template application.

#### Parameters

```typescript
interface UseNoteCreationParams {
  dirHandle: FileSystemDirectoryHandle | null;
  passphrase: string | null;
  onNoteCreated: () => void;
}
```

- `dirHandle` (FileSystemDirectoryHandle | null): File system handle
- `passphrase` (string | null): Encryption passphrase
- `onNoteCreated` (function): Callback after note created

#### Returns

```typescript
interface UseNoteCreationReturn {
  showNewNoteDialog: boolean;
  setShowNewNoteDialog: (show: boolean) => void;
  newNoteTitle: string;
  setNewNoteTitle: (title: string) => void;
  selectedTemplate: NoteTemplate | null;
  setSelectedTemplate: (template: NoteTemplate | null) => void;
  handleCreateNote: () => Promise<void>;
}
```

- `showNewNoteDialog` (boolean): Whether dialog is open
- `setShowNewNoteDialog` (function): Control dialog visibility
- `newNoteTitle` (string): New note title
- `setNewNoteTitle` (function): Update title
- `selectedTemplate` (NoteTemplate | null): Selected template
- `setSelectedTemplate` (function): Update template
- `handleCreateNote` (function): Create note with template

#### Example

```typescript
const {
  showNewNoteDialog,
  setShowNewNoteDialog,
  newNoteTitle,
  setNewNoteTitle,
  selectedTemplate,
  setSelectedTemplate,
  handleCreateNote,
} = useNoteCreation({
  dirHandle,
  passphrase,
  onNoteCreated: refreshNotesList,
});
```

---

## Settings Hooks

### useSettingsForm

Manages settings form state and persistence.

#### Parameters

```typescript
interface UseSettingsFormParams {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
}
```

- `settings` (Settings): Current settings
- `updateSettings` (function): Update settings callback

#### Returns

```typescript
interface UseSettingsFormReturn {
  formSettings: Settings;
  setFormSettings: (settings: Settings) => void;
  handleChange: (key: keyof Settings, value: any) => void;
  handleSave: () => Promise<void>;
  hasChanges: boolean;
}
```

- `formSettings` (Settings): Form state
- `setFormSettings` (function): Update form state
- `handleChange` (function): Update single field
- `handleSave` (function): Save settings
- `hasChanges` (boolean): Whether form has unsaved changes

#### Example

```typescript
const {
  formSettings,
  handleChange,
  handleSave,
  hasChanges,
} = useSettingsForm({
  settings: currentSettings,
  updateSettings: saveSettings,
});
```

---

## Template Hooks

### useTemplateManager

Manages template creation, editing, and deletion.

#### Parameters

```typescript
interface UseTemplateManagerParams {
  dirHandle: FileSystemDirectoryHandle | null;
  passphrase: string | null;
}
```

- `dirHandle` (FileSystemDirectoryHandle | null): File system handle
- `passphrase` (string | null): Encryption passphrase

#### Returns

```typescript
interface UseTemplateManagerReturn {
  templates: NoteTemplate[];
  loading: boolean;
  showNewTemplateDialog: boolean;
  setShowNewTemplateDialog: (show: boolean) => void;
  newTemplateName: string;
  setNewTemplateName: (name: string) => void;
  newTemplateContent: string;
  setNewTemplateContent: (content: string) => void;
  newTemplateIcon: string;
  setNewTemplateIcon: (icon: string) => void;
  handleCreateTemplate: () => Promise<void>;
  handleDeleteTemplate: (templateId: string) => Promise<void>;
}
```

- `templates` (NoteTemplate[]): All custom templates
- `loading` (boolean): Whether templates are loading
- `showNewTemplateDialog` (boolean): Whether dialog is open
- `setShowNewTemplateDialog` (function): Control dialog
- `newTemplateName` (string): New template name
- `setNewTemplateName` (function): Update name
- `newTemplateContent` (string): New template content
- `setNewTemplateContent` (function): Update content
- `newTemplateIcon` (string): New template icon
- `setNewTemplateIcon` (function): Update icon
- `handleCreateTemplate` (function): Create template
- `handleDeleteTemplate` (function): Delete template

#### Example

```typescript
const {
  templates,
  showNewTemplateDialog,
  setShowNewTemplateDialog,
  newTemplateName,
  setNewTemplateName,
  newTemplateContent,
  setNewTemplateContent,
  handleCreateTemplate,
  handleDeleteTemplate,
} = useTemplateManager({
  dirHandle,
  passphrase,
});
```

---

### useTemplateSelector

Loads and manages template selection (default + custom).

#### Parameters

```typescript
interface UseTemplateSelectorParams {
  dirHandle: FileSystemDirectoryHandle | null;
  passphrase: string | null;
}
```

- `dirHandle` (FileSystemDirectoryHandle | null): File system handle
- `passphrase` (string | null): Encryption passphrase

#### Returns

```typescript
interface UseTemplateSelectorReturn {
  customTemplates: NoteTemplate[];
  defaultTemplates: NoteTemplate[];
}
```

- `customTemplates` (NoteTemplate[]): User-created templates
- `defaultTemplates` (NoteTemplate[]): Built-in templates

#### Example

```typescript
const { customTemplates, defaultTemplates } = useTemplateSelector({
  dirHandle,
  passphrase,
});

const allTemplates = [...defaultTemplates, ...customTemplates];
```

---

## Security Hooks

### useUnlock

Manages repository unlock with passphrase validation.

#### Parameters

```typescript
interface UseUnlockParams {
  repoPath: string | null;
  setRepo: (path: string, passphrase: string) => void;
}
```

- `repoPath` (string | null): Repository path
- `setRepo` (function): Callback to set repo as unlocked

#### Returns

```typescript
interface UseUnlockReturn {
  passphrase: string;
  setPassphrase: (passphrase: string) => void;
  error: string;
  loading: boolean;
  handleUnlock: () => Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}
```

- `passphrase` (string): Current passphrase input
- `setPassphrase` (function): Update passphrase
- `error` (string): Error message
- `loading` (boolean): Whether unlock is in progress
- `handleUnlock` (function): Attempt unlock
- `handleKeyDown` (function): Handle Enter key

#### Example

```typescript
const {
  passphrase,
  setPassphrase,
  error,
  loading,
  handleUnlock,
  handleKeyDown,
} = useUnlock({
  repoPath,
  setRepo,
});
```

---

## Toolbar Hooks

### useEditorToolbar

Manages editor toolbar state and formatting commands.

#### Parameters

```typescript
interface UseEditorToolbarParams {
  editor: Editor | null;
}
```

- `editor` (Editor | null): TipTap editor instance

#### Returns

```typescript
interface UseEditorToolbarReturn {
  canUndo: boolean;
  canRedo: boolean;
  handleBold: () => void;
  handleItalic: () => void;
  handleStrike: () => void;
  handleCode: () => void;
  handleHeading: (level: 1 | 2 | 3) => void;
  handleBulletList: () => void;
  handleOrderedList: () => void;
  handleCodeBlock: () => void;
  handleBlockquote: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
}
```

- `canUndo` (boolean): Whether undo is available
- `canRedo` (boolean): Whether redo is available
- `handleBold` (function): Toggle bold
- `handleItalic` (function): Toggle italic
- `handleStrike` (function): Toggle strikethrough
- `handleCode` (function): Toggle inline code
- `handleHeading` (function): Set heading level
- `handleBulletList` (function): Toggle bullet list
- `handleOrderedList` (function): Toggle ordered list
- `handleCodeBlock` (function): Toggle code block
- `handleBlockquote` (function): Toggle blockquote
- `handleUndo` (function): Undo last change
- `handleRedo` (function): Redo last undone change

#### Example

```typescript
const {
  canUndo,
  canRedo,
  handleBold,
  handleItalic,
  handleHeading,
  handleUndo,
  handleRedo,
} = useEditorToolbar({ editor });
```

---

### useToolbarActions

Alternative toolbar hook with grouped actions.

#### Parameters

```typescript
interface UseToolbarActionsParams {
  editor: Editor | null;
}
```

- `editor` (Editor | null): TipTap editor instance

#### Returns

```typescript
interface UseToolbarActionsReturn {
  formatActions: {
    bold: () => void;
    italic: () => void;
    strike: () => void;
    code: () => void;
  };
  headingActions: {
    h1: () => void;
    h2: () => void;
    h3: () => void;
  };
  listActions: {
    bullet: () => void;
    ordered: () => void;
  };
  blockActions: {
    codeBlock: () => void;
    blockquote: () => void;
  };
  historyActions: {
    undo: () => void;
    redo: () => void;
  };
}
```

Grouped formatting actions by category.

#### Example

```typescript
const {
  formatActions,
  headingActions,
  listActions,
  historyActions,
} = useToolbarActions({ editor });

// Use grouped actions
<Button onClick={formatActions.bold}>Bold</Button>
<Button onClick={headingActions.h1}>H1</Button>
```

---

## Common Patterns

### Error Handling

All hooks that perform async operations return an `error` string:

```typescript
const { error, handleAction } = useFeature(params);

if (error) {
  return <Alert>{error}</Alert>;
}
```

### Loading States

Hooks with async operations return `loading` boolean:

```typescript
const { loading, data } = useData(params);

if (loading) {
  return <Spinner />;
}
```

### Context Dependencies

Hooks requiring context use the `useRepo` or `useSettings` hooks internally:

```typescript
// In hook
const { repoPath, passphrase } = useRepo();

// In component (wrap with provider)
<RepoProvider>
  <Component />
</RepoProvider>
```

### Callback Stability

All returned callbacks are memoized with `useCallback`:

```typescript
const handleAction = useCallback(() => {
  // Action logic
}, [dependencies]);
```

### TypeScript Usage

Always import and use type interfaces:

```typescript
import { useFeature, UseFeatureParams, UseFeatureReturn } from '@/hooks/useFeature';

const params: UseFeatureParams = { /* ... */ };
const result: UseFeatureReturn = useFeature(params);
```

---

## Testing

All hooks have comprehensive test coverage. Example test pattern:

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFeature } from '../useFeature';

describe('useFeature', () => {
  it('should handle action', async () => {
    const { result } = renderHook(() => useFeature(params));

    act(() => {
      result.current.handleAction();
    });

    await waitFor(() => {
      expect(result.current.state).toBe(expectedState);
    });
  });
});
```

See `hooks/__tests__/` for complete examples.

---

## Best Practices

### 1. Always Provide Required Parameters

```typescript
// Bad
const hook = useFeature();

// Good
const hook = useFeature({ required: 'value' });
```

### 2. Handle Errors

```typescript
const { error } = useFeature(params);

useEffect(() => {
  if (error) {
    toast.error(error);
  }
}, [error]);
```

### 3. Clean Up Side Effects

```typescript
useEffect(() => {
  const { cleanup } = useFeature(params);

  return cleanup;
}, []);
```

### 4. Type Everything

```typescript
const params: UseFeatureParams = { /* ... */ };
const { state }: UseFeatureReturn = useFeature(params);
```

### 5. Avoid Prop Drilling

```typescript
// Bad
<Component prop1={value1} prop2={value2} prop3={value3} />

// Good - use hook inside component
function Component() {
  const state = useFeature();
  return <UI {...state} />;
}
```

---

## Migration Guide

If you're refactoring a component to use these hooks:

### Before

```typescript
export function Component() {
  const [state, setState] = useState();
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    // Complex logic...
    setLoading(false);
  };

  return <UI />;
}
```

### After

```typescript
export const Component = memo(function Component() {
  const state = useFeature(params);

  return <UI {...state} />;
});
```

See [REFACTORING_PATTERN.md](./REFACTORING_PATTERN.md) for detailed migration steps.

---

## Contributing

When creating a new hook:

1. Follow naming convention: `use[Feature]`
2. Define TypeScript interfaces: `Use[Feature]Params` and `Use[Feature]Return`
3. Use `useCallback` for all functions
4. Handle errors gracefully
5. Add comprehensive tests in `hooks/__tests__/use[Feature].test.ts`
6. Document the hook in this file

---

## References

- [React Hooks Documentation](https://react.dev/reference/react)
- [Custom Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Testing Library Hooks](https://react-hooks-testing-library.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
