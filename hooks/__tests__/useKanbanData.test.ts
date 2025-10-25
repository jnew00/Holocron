/**
 * Tests for useKanbanData hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useKanbanData } from '../useKanbanData';
import { createDefaultBoard } from '@/lib/kanban/types';
import { NoteRepository, KanbanRepository } from '@/lib/repositories';

// Mock repositories
jest.mock('@/lib/repositories', () => ({
  NoteRepository: jest.fn(),
  KanbanRepository: jest.fn(),
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

// Mock task extractor
jest.mock('@/lib/kanban/taskExtractor', () => ({
  syncTasksToBoard: jest.fn((content, noteId, noteTitle, columns, boardId) => columns),
}));

describe('useKanbanData', () => {
  const mockOnBoardUpdate = jest.fn();
  const mockKanbanRepo = {
    readBoard: jest.fn(),
    saveBoard: jest.fn(),
  };
  const mockNoteRepo = {
    list: jest.fn(),
    read: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (KanbanRepository as jest.Mock).mockImplementation(() => mockKanbanRepo);
    (NoteRepository as jest.Mock).mockImplementation(() => mockNoteRepo);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const defaultProps = {
    boardId: 'test-board',
    repoPath: '/test/repo',
    syncTrigger: 0,
    onBoardUpdate: mockOnBoardUpdate,
  };

  it('should initialize with default board', () => {
    const { result } = renderHook(() => useKanbanData(defaultProps));

    expect(result.current.board).toBeDefined();
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isSyncing).toBe(false);
  });

  it('should load board from repository', async () => {
    const mockBoard = {
      ...createDefaultBoard(),
      id: 'test-board',
      name: 'Test Board',
    };
    mockKanbanRepo.readBoard.mockResolvedValue(mockBoard);

    const { result } = renderHook(() => useKanbanData(defaultProps));

    await waitFor(() => {
      expect(mockKanbanRepo.readBoard).toHaveBeenCalledWith('test-board');
    });

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });
  });

  it('should create default board when not found', async () => {
    const error = new (require('@/lib/repositories').RepositoryError)('Not found', 'NOT_FOUND');
    mockKanbanRepo.readBoard.mockRejectedValue(error);
    mockKanbanRepo.saveBoard.mockResolvedValue(undefined);

    const { result } = renderHook(() => useKanbanData(defaultProps));

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    await waitFor(() => {
      expect(mockKanbanRepo.saveBoard).toHaveBeenCalled();
    });
  });

  it('should save board when saveBoard is called', async () => {
    mockKanbanRepo.saveBoard.mockResolvedValue(undefined);

    const { result } = renderHook(() => useKanbanData(defaultProps));

    await act(async () => {
      await result.current.saveBoard();
    });

    expect(mockKanbanRepo.saveBoard).toHaveBeenCalled();
  });

  it('should call onBoardUpdate after save', async () => {
    mockKanbanRepo.saveBoard.mockResolvedValue(undefined);

    const { result } = renderHook(() => useKanbanData(defaultProps));

    await act(async () => {
      await result.current.saveBoard();
    });

    expect(mockOnBoardUpdate).toHaveBeenCalled();
  });

  it('should not load board when repoPath is null', () => {
    renderHook(() =>
      useKanbanData({
        ...defaultProps,
        repoPath: null,
      })
    );

    expect(mockKanbanRepo.readBoard).not.toHaveBeenCalled();
  });

  it('should not load board when boardId is empty', () => {
    renderHook(() =>
      useKanbanData({
        ...defaultProps,
        boardId: '',
      })
    );

    expect(mockKanbanRepo.readBoard).not.toHaveBeenCalled();
  });

  it('should sync tasks when syncTrigger changes', async () => {
    mockKanbanRepo.readBoard.mockResolvedValue(createDefaultBoard());
    mockNoteRepo.list.mockResolvedValue([]);

    const { result, rerender } = renderHook(
      ({ syncTrigger }) => useKanbanData({ ...defaultProps, syncTrigger }),
      { initialProps: { syncTrigger: 0 } }
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    // Trigger sync
    rerender({ syncTrigger: 1 });

    await waitFor(() => {
      expect(mockNoteRepo.list).toHaveBeenCalled();
    });
  });

  it('should auto-save board after changes', async () => {
    mockKanbanRepo.readBoard.mockResolvedValue(createDefaultBoard());
    mockKanbanRepo.saveBoard.mockResolvedValue(undefined);

    const { result } = renderHook(() => useKanbanData(defaultProps));

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    mockKanbanRepo.saveBoard.mockClear();

    // Update board
    act(() => {
      result.current.setBoard((prev) => ({
        ...prev,
        name: 'Updated Board',
      }));
    });

    // Fast-forward debounce timer
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockKanbanRepo.saveBoard).toHaveBeenCalled();
    });
  });

  it('should handle save errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockKanbanRepo.saveBoard.mockRejectedValue(new Error('Save failed'));

    const { result } = renderHook(() => useKanbanData(defaultProps));

    await act(async () => {
      await result.current.saveBoard();
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
