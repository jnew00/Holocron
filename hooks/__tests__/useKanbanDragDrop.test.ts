/**
 * Tests for useKanbanDragDrop hook
 */

import { renderHook, act } from '@testing-library/react';
import { useKanbanDragDrop } from '../useKanbanDragDrop';
import { KanbanBoard, createCard } from '@/lib/kanban/types';

// Mock @dnd-kit/core
jest.mock('@dnd-kit/core', () => ({
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
  PointerSensor: jest.fn(),
}));

// Mock @dnd-kit/sortable
jest.mock('@dnd-kit/sortable', () => ({
  arrayMove: jest.fn((arr, from, to) => {
    const newArr = [...arr];
    const [item] = newArr.splice(from, 1);
    newArr.splice(to, 0, item);
    return newArr;
  }),
}));

describe('useKanbanDragDrop', () => {
  const card1 = createCard('Card 1', 'Description 1');
  const card2 = createCard('Card 2', 'Description 2');
  const card3 = createCard('Card 3', 'Description 3');

  const mockSetBoard = jest.fn();
  const mockBoard: KanbanBoard = {
    id: 'test-board',
    name: 'Test Board',
    columns: [
      { id: 'todo', name: 'To Do', cards: [card1, card2] },
      { id: 'in-progress', name: 'In Progress', cards: [card3] },
      { id: 'done', name: 'Done', cards: [] },
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with null activeCard', () => {
    const { result } = renderHook(() =>
      useKanbanDragDrop({ board: mockBoard, setBoard: mockSetBoard })
    );

    expect(result.current.activeCard).toBeNull();
  });

  it('should set activeCard on drag start', () => {
    const { result } = renderHook(() =>
      useKanbanDragDrop({ board: mockBoard, setBoard: mockSetBoard })
    );

    act(() => {
      result.current.handleDragStart({
        active: { id: card1.id, data: { current: null }, rect: { current: null } },
      } as any);
    });

    expect(result.current.activeCard).toEqual(card1);
  });

  it('should clear activeCard on drag end', () => {
    const { result } = renderHook(() =>
      useKanbanDragDrop({ board: mockBoard, setBoard: mockSetBoard })
    );

    act(() => {
      result.current.handleDragStart({
        active: { id: card1.id, data: { current: null }, rect: { current: null } },
      } as any);
    });

    expect(result.current.activeCard).toEqual(card1);

    act(() => {
      result.current.handleDragEnd({
        active: { id: card1.id, data: { current: null }, rect: { current: null } },
        over: { id: card2.id, data: { current: null }, rect: { current: null } },
      } as any);
    });

    expect(result.current.activeCard).toBeNull();
  });

  it('should handle drag over between columns', () => {
    mockSetBoard.mockImplementation((updater) => {
      if (typeof updater === 'function') {
        updater(mockBoard);
      }
    });

    const { result } = renderHook(() =>
      useKanbanDragDrop({ board: mockBoard, setBoard: mockSetBoard })
    );

    act(() => {
      result.current.handleDragOver({
        active: { id: card1.id, data: { current: null }, rect: { current: null } },
        over: { id: 'in-progress', data: { current: null }, rect: { current: null } },
      } as any);
    });

    expect(mockSetBoard).toHaveBeenCalled();
  });

  it('should not update board when dragging over same column', () => {
    mockSetBoard.mockImplementation((updater) => {
      if (typeof updater === 'function') {
        const result = updater(mockBoard);
        expect(result).toBe(mockBoard); // Should return same reference
      }
    });

    const { result } = renderHook(() =>
      useKanbanDragDrop({ board: mockBoard, setBoard: mockSetBoard })
    );

    act(() => {
      result.current.handleDragOver({
        active: { id: card1.id, data: { current: null }, rect: { current: null } },
        over: { id: card2.id, data: { current: null }, rect: { current: null } },
      } as any);
    });

    expect(mockSetBoard).toHaveBeenCalled();
  });

  it('should handle drag end reordering within same column', () => {
    mockSetBoard.mockImplementation((updater) => {
      if (typeof updater === 'function') {
        updater(mockBoard);
      }
    });

    const { result } = renderHook(() =>
      useKanbanDragDrop({ board: mockBoard, setBoard: mockSetBoard })
    );

    act(() => {
      result.current.handleDragEnd({
        active: { id: card1.id, data: { current: null }, rect: { current: null } },
        over: { id: card2.id, data: { current: null }, rect: { current: null } },
      } as any);
    });

    expect(mockSetBoard).toHaveBeenCalled();
  });

  it('should not update board when dropping at same position', () => {
    const { result } = renderHook(() =>
      useKanbanDragDrop({ board: mockBoard, setBoard: mockSetBoard })
    );

    act(() => {
      result.current.handleDragEnd({
        active: { id: card1.id, data: { current: null }, rect: { current: null } },
        over: { id: card1.id, data: { current: null }, rect: { current: null } },
      } as any);
    });

    // Should not call setBoard for same position
    expect(mockSetBoard).not.toHaveBeenCalled();
  });

  it('should handle drag over with no over target', () => {
    const { result } = renderHook(() =>
      useKanbanDragDrop({ board: mockBoard, setBoard: mockSetBoard })
    );

    act(() => {
      result.current.handleDragOver({
        active: { id: card1.id, data: { current: null }, rect: { current: null } },
        over: null,
      } as any);
    });

    expect(mockSetBoard).not.toHaveBeenCalled();
  });

  it('should handle drag end with no over target', () => {
    const { result } = renderHook(() =>
      useKanbanDragDrop({ board: mockBoard, setBoard: mockSetBoard })
    );

    act(() => {
      result.current.handleDragStart({
        active: { id: card1.id, data: { current: null }, rect: { current: null } },
      } as any);
    });

    act(() => {
      result.current.handleDragEnd({
        active: { id: card1.id, data: { current: null }, rect: { current: null } },
        over: null,
      } as any);
    });

    expect(result.current.activeCard).toBeNull();
    expect(mockSetBoard).not.toHaveBeenCalled();
  });

  it('should handle drag start with invalid card ID', () => {
    const { result } = renderHook(() =>
      useKanbanDragDrop({ board: mockBoard, setBoard: mockSetBoard })
    );

    act(() => {
      result.current.handleDragStart({
        active: { id: 'non-existent', data: { current: null }, rect: { current: null } },
      } as any);
    });

    expect(result.current.activeCard).toBeNull();
  });

  it('should provide sensors configuration', () => {
    const { result } = renderHook(() =>
      useKanbanDragDrop({ board: mockBoard, setBoard: mockSetBoard })
    );

    expect(result.current.sensors).toBeDefined();
  });
});
