/**
 * Tests for useAddCard hook
 */

import { renderHook, act } from '@testing-library/react';
import { useAddCard } from '../useAddCard';
import { KanbanBoard } from '@/lib/kanban/types';

describe('useAddCard', () => {
  const mockOnAddCard = jest.fn();
  const mockOnOpenChange = jest.fn();
  const mockColumns: KanbanBoard['columns'] = [
    { id: 'todo', name: 'To Do', cards: [] },
    { id: 'in-progress', name: 'In Progress', cards: [] },
    { id: 'done', name: 'Done', cards: [] },
  ];

  beforeEach(() => {
    mockOnAddCard.mockClear();
    mockOnOpenChange.mockClear();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useAddCard({
        onAddCard: mockOnAddCard,
        onOpenChange: mockOnOpenChange,
        columns: mockColumns,
      })
    );

    expect(result.current.newCardTitle).toBe('');
    expect(result.current.newCardDescription).toBe('');
    expect(result.current.newCardColumn).toBe('todo');
  });

  it('should update title when setNewCardTitle is called', () => {
    const { result } = renderHook(() =>
      useAddCard({
        onAddCard: mockOnAddCard,
        onOpenChange: mockOnOpenChange,
        columns: mockColumns,
      })
    );

    act(() => {
      result.current.setNewCardTitle('New Task');
    });

    expect(result.current.newCardTitle).toBe('New Task');
  });

  it('should update description when setNewCardDescription is called', () => {
    const { result } = renderHook(() =>
      useAddCard({
        onAddCard: mockOnAddCard,
        onOpenChange: mockOnOpenChange,
        columns: mockColumns,
      })
    );

    act(() => {
      result.current.setNewCardDescription('Task description');
    });

    expect(result.current.newCardDescription).toBe('Task description');
  });

  it('should update column when setNewCardColumn is called', () => {
    const { result } = renderHook(() =>
      useAddCard({
        onAddCard: mockOnAddCard,
        onOpenChange: mockOnOpenChange,
        columns: mockColumns,
      })
    );

    act(() => {
      result.current.setNewCardColumn('in-progress');
    });

    expect(result.current.newCardColumn).toBe('in-progress');
  });

  it('should call onAddCard with correct parameters when handleAddCard is called', () => {
    const { result } = renderHook(() =>
      useAddCard({
        onAddCard: mockOnAddCard,
        onOpenChange: mockOnOpenChange,
        columns: mockColumns,
      })
    );

    act(() => {
      result.current.setNewCardTitle('Test Task');
      result.current.setNewCardDescription('Test Description');
      result.current.setNewCardColumn('done');
    });

    act(() => {
      result.current.handleAddCard();
    });

    expect(mockOnAddCard).toHaveBeenCalledWith(
      'Test Task',
      'Test Description',
      'done'
    );
  });

  it('should reset form after adding card', () => {
    const { result } = renderHook(() =>
      useAddCard({
        onAddCard: mockOnAddCard,
        onOpenChange: mockOnOpenChange,
        columns: mockColumns,
      })
    );

    act(() => {
      result.current.setNewCardTitle('Test Task');
      result.current.setNewCardDescription('Test Description');
      result.current.setNewCardColumn('done');
    });

    act(() => {
      result.current.handleAddCard();
    });

    expect(result.current.newCardTitle).toBe('');
    expect(result.current.newCardDescription).toBe('');
  });

  it('should call onOpenChange with false after adding card', () => {
    const { result } = renderHook(() =>
      useAddCard({
        onAddCard: mockOnAddCard,
        onOpenChange: mockOnOpenChange,
        columns: mockColumns,
      })
    );

    act(() => {
      result.current.setNewCardTitle('Test Task');
    });

    act(() => {
      result.current.handleAddCard();
    });

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should not add card when title is empty', () => {
    const { result } = renderHook(() =>
      useAddCard({
        onAddCard: mockOnAddCard,
        onOpenChange: mockOnOpenChange,
        columns: mockColumns,
      })
    );

    act(() => {
      result.current.handleAddCard();
    });

    expect(mockOnAddCard).not.toHaveBeenCalled();
    expect(mockOnOpenChange).not.toHaveBeenCalled();
  });

  it('should not add card when title is only whitespace', () => {
    const { result } = renderHook(() =>
      useAddCard({
        onAddCard: mockOnAddCard,
        onOpenChange: mockOnOpenChange,
        columns: mockColumns,
      })
    );

    act(() => {
      result.current.setNewCardTitle('   ');
    });

    act(() => {
      result.current.handleAddCard();
    });

    expect(mockOnAddCard).not.toHaveBeenCalled();
  });

  it('should pass undefined for empty description', () => {
    const { result } = renderHook(() =>
      useAddCard({
        onAddCard: mockOnAddCard,
        onOpenChange: mockOnOpenChange,
        columns: mockColumns,
      })
    );

    act(() => {
      result.current.setNewCardTitle('Task without description');
    });

    act(() => {
      result.current.handleAddCard();
    });

    expect(mockOnAddCard).toHaveBeenCalledWith(
      'Task without description',
      undefined,
      'todo'
    );
  });

  it('should handle empty columns array', () => {
    const { result } = renderHook(() =>
      useAddCard({
        onAddCard: mockOnAddCard,
        onOpenChange: mockOnOpenChange,
        columns: [],
      })
    );

    expect(result.current.newCardColumn).toBe('todo');
  });

  it('should preserve column selection when not reset', () => {
    const { result } = renderHook(() =>
      useAddCard({
        onAddCard: mockOnAddCard,
        onOpenChange: mockOnOpenChange,
        columns: mockColumns,
      })
    );

    act(() => {
      result.current.setNewCardColumn('in-progress');
    });

    expect(result.current.newCardColumn).toBe('in-progress');

    // Add card
    act(() => {
      result.current.setNewCardTitle('Test');
      result.current.handleAddCard();
    });

    // Column should stay as 'in-progress' (not reset)
    expect(result.current.newCardColumn).toBe('in-progress');
  });

  it('should handle multiple rapid additions', () => {
    const { result } = renderHook(() =>
      useAddCard({
        onAddCard: mockOnAddCard,
        onOpenChange: mockOnOpenChange,
        columns: mockColumns,
      })
    );

    act(() => {
      result.current.setNewCardTitle('Task 1');
      result.current.handleAddCard();
    });

    act(() => {
      result.current.setNewCardTitle('Task 2');
      result.current.handleAddCard();
    });

    act(() => {
      result.current.setNewCardTitle('Task 3');
      result.current.handleAddCard();
    });

    expect(mockOnAddCard).toHaveBeenCalledTimes(3);
    expect(mockOnOpenChange).toHaveBeenCalledTimes(3);
  });

  it('should handle unicode characters in title and description', () => {
    const { result } = renderHook(() =>
      useAddCard({
        onAddCard: mockOnAddCard,
        onOpenChange: mockOnOpenChange,
        columns: mockColumns,
      })
    );

    act(() => {
      result.current.setNewCardTitle('你好世界 🌍');
      result.current.setNewCardDescription('Test with émojis 🎉');
    });

    act(() => {
      result.current.handleAddCard();
    });

    expect(mockOnAddCard).toHaveBeenCalledWith(
      '你好世界 🌍',
      'Test with émojis 🎉',
      'todo'
    );
  });

  it('should update handlers when callbacks change', () => {
    const newOnAddCard = jest.fn();
    const newOnOpenChange = jest.fn();

    const { result, rerender } = renderHook(
      ({ onAddCard, onOpenChange, columns }) =>
        useAddCard({ onAddCard, onOpenChange, columns }),
      {
        initialProps: {
          onAddCard: mockOnAddCard,
          onOpenChange: mockOnOpenChange,
          columns: mockColumns,
        },
      }
    );

    act(() => {
      result.current.setNewCardTitle('Test Task');
    });

    // Rerender with new callbacks
    rerender({
      onAddCard: newOnAddCard,
      onOpenChange: newOnOpenChange,
      columns: mockColumns,
    });

    act(() => {
      result.current.handleAddCard();
    });

    expect(newOnAddCard).toHaveBeenCalled();
    expect(newOnOpenChange).toHaveBeenCalled();
    expect(mockOnAddCard).not.toHaveBeenCalled();
    expect(mockOnOpenChange).not.toHaveBeenCalled();
  });
});
