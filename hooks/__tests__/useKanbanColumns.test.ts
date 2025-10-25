/**
 * Tests for useKanbanColumns hook
 */

import { renderHook, act } from '@testing-library/react';
import { useKanbanColumns } from '../useKanbanColumns';
import { KanbanBoard } from '@/lib/kanban/types';

describe('useKanbanColumns', () => {
  const mockSetBoard = jest.fn();
  const mockBoard: KanbanBoard = {
    id: 'test-board',
    name: 'Test Board',
    columns: [
      { id: 'todo', title: 'To Do', cards: [], color: '#blue' },
      { id: 'in-progress', title: 'In Progress', cards: [], color: '#yellow' },
      { id: 'done', title: 'Done', cards: [], color: '#green' },
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetBoard.mockClear();
  });

  it('should initialize with board columns', () => {
    const { result } = renderHook(() =>
      useKanbanColumns({ board: mockBoard, setBoard: mockSetBoard })
    );

    expect(result.current.editingColumns).toHaveLength(3);
    expect(result.current.isSettingsOpen).toBe(false);
  });

  it('should open settings with copied columns', () => {
    const { result } = renderHook(() =>
      useKanbanColumns({ board: mockBoard, setBoard: mockSetBoard })
    );

    act(() => {
      result.current.handleOpenSettings();
    });

    expect(result.current.isSettingsOpen).toBe(true);
    expect(result.current.editingColumns).toHaveLength(3);
  });

  it('should add new column to editing state', () => {
    const { result } = renderHook(() =>
      useKanbanColumns({ board: mockBoard, setBoard: mockSetBoard })
    );

    act(() => {
      result.current.handleOpenSettings();
    });

    act(() => {
      result.current.handleAddColumn();
    });

    expect(result.current.editingColumns).toHaveLength(4);
    expect(result.current.editingColumns[3].title).toBe('New Column');
  });

  it('should delete column from editing state', () => {
    const { result } = renderHook(() =>
      useKanbanColumns({ board: mockBoard, setBoard: mockSetBoard })
    );

    act(() => {
      result.current.handleOpenSettings();
    });

    act(() => {
      result.current.handleDeleteColumn('todo');
    });

    expect(result.current.editingColumns).toHaveLength(2);
    expect(result.current.editingColumns.find((col) => col.id === 'todo')).toBeUndefined();
  });

  it('should update column in editing state', () => {
    const { result } = renderHook(() =>
      useKanbanColumns({ board: mockBoard, setBoard: mockSetBoard })
    );

    act(() => {
      result.current.handleOpenSettings();
    });

    act(() => {
      result.current.handleUpdateColumn('todo', { title: 'Updated Name' });
    });

    const updatedColumn = result.current.editingColumns.find((col) => col.id === 'todo');
    expect(updatedColumn?.title).toBe('Updated Name');
  });

  it('should update column with multiple properties', () => {
    const { result } = renderHook(() =>
      useKanbanColumns({ board: mockBoard, setBoard: mockSetBoard })
    );

    act(() => {
      result.current.handleOpenSettings();
    });

    act(() => {
      result.current.handleUpdateColumn('todo', {
        title: 'Updated Name',
        color: '#red',
        wipLimit: 5,
      });
    });

    const updatedColumn = result.current.editingColumns.find((col) => col.id === 'todo');
    expect(updatedColumn?.title).toBe('Updated Name');
    expect(updatedColumn?.color).toBe('#red');
    expect(updatedColumn?.wipLimit).toBe(5);
  });

  it('should save columns to board', () => {
    const { result } = renderHook(() =>
      useKanbanColumns({ board: mockBoard, setBoard: mockSetBoard })
    );

    act(() => {
      result.current.handleOpenSettings();
    });

    act(() => {
      result.current.handleUpdateColumn('todo', { title: 'Updated Todo' });
    });

    act(() => {
      result.current.handleSaveColumns();
    });

    expect(mockSetBoard).toHaveBeenCalled();
    expect(result.current.isSettingsOpen).toBe(false);
  });

  it('should preserve cards when saving columns', () => {
    const boardWithCards: KanbanBoard = {
      ...mockBoard,
      columns: [
        {
          id: 'todo',
          title: 'To Do',
          cards: [{ id: 'card-1', title: 'Task 1', createdAt: '2025-01-01', updatedAt: '2025-01-01' }],
          color: '#blue',
        },
        { id: 'done', title: 'Done', cards: [], color: '#green' },
      ],
    };

    mockSetBoard.mockImplementation((updater) => {
      const newBoard = updater(boardWithCards);
      expect(newBoard.columns[0].cards).toHaveLength(1);
    });

    const { result } = renderHook(() =>
      useKanbanColumns({ board: boardWithCards, setBoard: mockSetBoard })
    );

    act(() => {
      result.current.handleOpenSettings();
    });

    act(() => {
      result.current.handleUpdateColumn('todo', { title: 'Updated Todo' });
    });

    act(() => {
      result.current.handleSaveColumns();
    });

    expect(mockSetBoard).toHaveBeenCalled();
  });

  it('should close settings on save', () => {
    const { result } = renderHook(() =>
      useKanbanColumns({ board: mockBoard, setBoard: mockSetBoard })
    );

    act(() => {
      result.current.handleOpenSettings();
    });

    expect(result.current.isSettingsOpen).toBe(true);

    act(() => {
      result.current.handleSaveColumns();
    });

    expect(result.current.isSettingsOpen).toBe(false);
  });

  it('should allow manual control of isSettingsOpen', () => {
    const { result } = renderHook(() =>
      useKanbanColumns({ board: mockBoard, setBoard: mockSetBoard })
    );

    act(() => {
      result.current.setIsSettingsOpen(true);
    });

    expect(result.current.isSettingsOpen).toBe(true);

    act(() => {
      result.current.setIsSettingsOpen(false);
    });

    expect(result.current.isSettingsOpen).toBe(false);
  });

  it('should allow manual control of editingColumns', () => {
    const { result } = renderHook(() =>
      useKanbanColumns({ board: mockBoard, setBoard: mockSetBoard })
    );

    const newColumns = [
      { id: 'custom', title: 'Custom', cards: [], color: '#purple' },
    ];

    act(() => {
      result.current.setEditingColumns(newColumns);
    });

    expect(result.current.editingColumns).toEqual(newColumns);
  });

  it('should handle adding multiple columns', () => {
    const { result } = renderHook(() =>
      useKanbanColumns({ board: mockBoard, setBoard: mockSetBoard })
    );

    act(() => {
      result.current.handleOpenSettings();
    });

    act(() => {
      result.current.handleAddColumn();
      result.current.handleAddColumn();
      result.current.handleAddColumn();
    });

    expect(result.current.editingColumns).toHaveLength(6);
  });

  it('should handle deleting all columns', () => {
    const { result } = renderHook(() =>
      useKanbanColumns({ board: mockBoard, setBoard: mockSetBoard })
    );

    act(() => {
      result.current.handleOpenSettings();
    });

    act(() => {
      result.current.handleDeleteColumn('todo');
      result.current.handleDeleteColumn('in-progress');
      result.current.handleDeleteColumn('done');
    });

    expect(result.current.editingColumns).toHaveLength(0);
  });

  it('should generate unique IDs for new columns', () => {
    let mockTime = 1000000;
    jest.spyOn(Date, 'now').mockImplementation(() => mockTime++);

    const { result } = renderHook(() =>
      useKanbanColumns({ board: mockBoard, setBoard: mockSetBoard })
    );

    act(() => {
      result.current.handleOpenSettings();
    });

    act(() => {
      result.current.handleAddColumn();
    });

    act(() => {
      result.current.handleAddColumn();
    });

    const ids = result.current.editingColumns.slice(-2).map((col) => col.id);
    expect(ids[0]).not.toBe(ids[1]);

    jest.restoreAllMocks();
  });

  it('should reset editing columns when opening settings again', () => {
    const { result } = renderHook(() =>
      useKanbanColumns({ board: mockBoard, setBoard: mockSetBoard })
    );

    // Open settings and modify
    act(() => {
      result.current.handleOpenSettings();
    });

    act(() => {
      result.current.handleAddColumn();
      result.current.handleUpdateColumn('todo', { title: 'Modified' });
    });

    // Close without saving
    act(() => {
      result.current.setIsSettingsOpen(false);
    });

    // Open again
    act(() => {
      result.current.handleOpenSettings();
    });

    // Should reset to original board columns
    expect(result.current.editingColumns).toHaveLength(3);
    const todoColumn = result.current.editingColumns.find((col) => col.id === 'todo');
    expect(todoColumn?.title).toBe('To Do');
  });

  it('should handle board prop changes', () => {
    const { result, rerender } = renderHook(
      ({ board }) => useKanbanColumns({ board, setBoard: mockSetBoard }),
      { initialProps: { board: mockBoard } }
    );

    expect(result.current.editingColumns).toHaveLength(3);

    const updatedBoard: KanbanBoard = {
      ...mockBoard,
      columns: [{ id: 'new-col', title: 'New Column', cards: [], color: '#red' }],
    };

    rerender({ board: updatedBoard });

    // editingColumns doesn't automatically update until handleOpenSettings is called
    act(() => {
      result.current.handleOpenSettings();
    });

    expect(result.current.editingColumns).toHaveLength(1);
  });
});
