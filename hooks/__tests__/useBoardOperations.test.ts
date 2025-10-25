/**
 * Tests for useBoardOperations hook
 */

import { renderHook, act } from '@testing-library/react';
import { useBoardOperations } from '../useBoardOperations';

// Mock KanbanRepository
jest.mock('@/lib/repositories', () => ({
  KanbanRepository: jest.fn().mockImplementation(() => ({
    listBoards: jest.fn().mockResolvedValue([]),
    deleteBoard: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('useBoardOperations', () => {
  const mockOnBoardsChange = jest.fn();

  beforeEach(() => {
    mockOnBoardsChange.mockClear();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() =>
      useBoardOperations({
        repoPath: '/test/repo',
        onBoardsChange: mockOnBoardsChange,
      })
    );

    expect(result.current.newBoardName).toBe('');
    expect(result.current.newBoardIcon).toBe('');
    expect(result.current.editingBoard).toBeNull();
    expect(typeof result.current.handleCreateBoard).toBe('function');
    expect(typeof result.current.handleUpdateBoard).toBe('function');
    expect(typeof result.current.handleDeleteBoard).toBe('function');
  });

  it('should handle missing repoPath', async () => {
    const { result } = renderHook(() =>
      useBoardOperations({
        repoPath: null,
        onBoardsChange: mockOnBoardsChange,
      })
    );

    // Should not be able to create board without repoPath
    const success = await result.current.handleCreateBoard();
    expect(success).toBe(false);
    expect(mockOnBoardsChange).not.toHaveBeenCalled();
  });
});
