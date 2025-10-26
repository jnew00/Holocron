/**
 * Tests for useKanbanCards hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useKanbanCards } from '../useKanbanCards';
import { KanbanBoard, createCard } from '@/lib/kanban/types';
import { NoteRepository } from '@/lib/repositories';

// Mock NoteRepository
jest.mock('@/lib/repositories', () => ({
  NoteRepository: jest.fn(),
  RepositoryError: class RepositoryError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
    }
    is(code: string) {
      return this.code === code;
    }
  },
}));

describe('useKanbanCards', () => {
  const mockSetBoard = jest.fn();
  const mockBoard: KanbanBoard = {
    id: 'test-board',
    name: 'Test Board',
    columns: [
      { id: 'todo', title: 'To Do', cards: [] },
      { id: 'in-progress', title: 'In Progress', cards: [] },
      { id: 'done', title: 'Done', cards: [] },
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  const mockNoteRepo = {
    read: jest.fn(),
    write: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (NoteRepository as jest.Mock).mockImplementation(() => mockNoteRepo);
    mockSetBoard.mockImplementation((updater) => {
      if (typeof updater === 'function') {
        updater(mockBoard);
      }
    });
  });

  it('should initialize with isSyncing false', () => {
    const { result } = renderHook(() =>
      useKanbanCards({
        board: mockBoard,
        setBoard: mockSetBoard,
        repoPath: '/test/repo',
      })
    );

    expect(result.current.isSyncing).toBe(false);
  });

  it('should add card to specified column', () => {
    const { result } = renderHook(() =>
      useKanbanCards({
        board: mockBoard,
        setBoard: mockSetBoard,
        repoPath: '/test/repo',
      })
    );

    act(() => {
      result.current.handleAddCard('New Task', 'Task description', 'todo');
    });

    expect(mockSetBoard).toHaveBeenCalled();
  });

  it('should not add card with empty title', () => {
    const { result } = renderHook(() =>
      useKanbanCards({
        board: mockBoard,
        setBoard: mockSetBoard,
        repoPath: '/test/repo',
      })
    );

    act(() => {
      result.current.handleAddCard('', 'Description', 'todo');
    });

    expect(mockSetBoard).not.toHaveBeenCalled();
  });

  it('should not add card with whitespace-only title', () => {
    const { result } = renderHook(() =>
      useKanbanCards({
        board: mockBoard,
        setBoard: mockSetBoard,
        repoPath: '/test/repo',
      })
    );

    act(() => {
      result.current.handleAddCard('   ', 'Description', 'todo');
    });

    expect(mockSetBoard).not.toHaveBeenCalled();
  });

  it('should delete card by id', () => {
    const { result } = renderHook(() =>
      useKanbanCards({
        board: mockBoard,
        setBoard: mockSetBoard,
        repoPath: '/test/repo',
      })
    );

    act(() => {
      result.current.handleDeleteCard('card-123');
    });

    expect(mockSetBoard).toHaveBeenCalled();
  });

  it('should update card with partial updates', () => {
    const { result } = renderHook(() =>
      useKanbanCards({
        board: mockBoard,
        setBoard: mockSetBoard,
        repoPath: '/test/repo',
      })
    );

    act(() => {
      result.current.handleUpdateCard('card-123', {
        title: 'Updated Title',
        priority: 'high',
      });
    });

    expect(mockSetBoard).toHaveBeenCalled();
  });

  it('should archive done column cards', async () => {
    const boardWithCards: KanbanBoard = {
      ...mockBoard,
      columns: [
        ...mockBoard.columns.slice(0, 2),
        {
          id: 'done',
          title: 'Done',
          cards: [
            createCard('Task 1', 'Description 1'),
            createCard('Task 2', 'Description 2'),
          ],
        },
      ],
    };

    mockNoteRepo.read.mockResolvedValue({ content: '' });
    mockNoteRepo.write.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useKanbanCards({
        board: boardWithCards,
        setBoard: mockSetBoard,
        repoPath: '/test/repo',
      })
    );

    await act(async () => {
      await result.current.handleArchiveDoneColumn('done');
    });

    expect(mockNoteRepo.write).toHaveBeenCalledWith({
      notePath: 'archive/kanban-archive.md',
      content: expect.stringContaining('Kanban Archive'),
    });
    expect(mockSetBoard).toHaveBeenCalled();
  });

  it('should not archive when repoPath is null', async () => {
    const { result } = renderHook(() =>
      useKanbanCards({
        board: mockBoard,
        setBoard: mockSetBoard,
        repoPath: null,
      })
    );

    await act(async () => {
      await result.current.handleArchiveDoneColumn('done');
    });

    expect(mockNoteRepo.write).not.toHaveBeenCalled();
  });

  it('should not archive when column is empty', async () => {
    const { result } = renderHook(() =>
      useKanbanCards({
        board: mockBoard,
        setBoard: mockSetBoard,
        repoPath: '/test/repo',
      })
    );

    await act(async () => {
      await result.current.handleArchiveDoneColumn('done');
    });

    expect(mockNoteRepo.write).not.toHaveBeenCalled();
  });

  it('should handle archive errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const boardWithCards: KanbanBoard = {
      ...mockBoard,
      columns: [
        ...mockBoard.columns.slice(0, 2),
        {
          id: 'done',
          title: 'Done',
          cards: [createCard('Task 1', 'Description 1')],
        },
      ],
    };

    mockNoteRepo.read.mockResolvedValue({ content: '' });
    mockNoteRepo.write.mockRejectedValue(new Error('Write failed'));

    const { result } = renderHook(() =>
      useKanbanCards({
        board: boardWithCards,
        setBoard: mockSetBoard,
        repoPath: '/test/repo',
      })
    );

    await act(async () => {
      await result.current.handleArchiveDoneColumn('done');
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to archive tasks:',
      expect.any(Error)
    );
    expect(result.current.isSyncing).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it('should set isSyncing to true during archive', async () => {
    const boardWithCards: KanbanBoard = {
      ...mockBoard,
      columns: [
        ...mockBoard.columns.slice(0, 2),
        {
          id: 'done',
          title: 'Done',
          cards: [createCard('Task 1', 'Description 1')],
        },
      ],
    };

    let resolveSave: () => void;
    const savePromise = new Promise<void>((resolve) => {
      resolveSave = resolve;
    });

    mockNoteRepo.read.mockResolvedValue({ content: '' });
    mockNoteRepo.write.mockReturnValue(savePromise);

    const { result } = renderHook(() =>
      useKanbanCards({
        board: boardWithCards,
        setBoard: mockSetBoard,
        repoPath: '/test/repo',
      })
    );

    // Start the archive operation
    let archivePromise: Promise<void>;
    act(() => {
      archivePromise = result.current.handleArchiveDoneColumn('done');
    });

    // Wait for isSyncing to become true
    await waitFor(() => {
      expect(result.current.isSyncing).toBe(true);
    });

    // Resolve the save operation
    await act(async () => {
      resolveSave!();
      await archivePromise!;
    });

    // After completion, isSyncing should be false
    expect(result.current.isSyncing).toBe(false);
  });

  it('should append to existing archive content', async () => {
    const existingArchive = '# Kanban Archive\n\n## Old Entry\n- Old task\n';
    const boardWithCards: KanbanBoard = {
      ...mockBoard,
      columns: [
        ...mockBoard.columns.slice(0, 2),
        {
          id: 'done',
          title: 'Done',
          cards: [createCard('New Task', 'New Description')],
        },
      ],
    };

    mockNoteRepo.read.mockResolvedValue({ content: existingArchive });
    mockNoteRepo.write.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useKanbanCards({
        board: boardWithCards,
        setBoard: mockSetBoard,
        repoPath: '/test/repo',
      })
    );

    await act(async () => {
      await result.current.handleArchiveDoneColumn('done');
    });

    const writeCall = mockNoteRepo.write.mock.calls[0][0];
    expect(writeCall.content).toContain('New Task');
    expect(writeCall.content).toContain('Old Entry');
  });
});
