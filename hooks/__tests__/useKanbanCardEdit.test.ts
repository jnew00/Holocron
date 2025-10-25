/**
 * Tests for useKanbanCardEdit hook
 */

import { renderHook, act } from '@testing-library/react';
import { useKanbanCardEdit } from '../useKanbanCardEdit';
import { KanbanCard } from '@/lib/kanban/types';

describe('useKanbanCardEdit', () => {
  const mockCard: KanbanCard = {
    id: 'card-1',
    title: 'Test Card',
    description: 'Test Description',
    priority: 'medium',
    tags: ['tag1', 'tag2'],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  it('should initialize with card values', () => {
    const { result } = renderHook(() =>
      useKanbanCardEdit({ card: mockCard, onUpdate: mockOnUpdate })
    );

    expect(result.current.editTitle).toBe('Test Card');
    expect(result.current.editDescription).toBe('Test Description');
    expect(result.current.editPriority).toBe('medium');
    expect(result.current.editTags).toEqual(['tag1', 'tag2']);
    expect(result.current.isExpanded).toBe(false);
    expect(result.current.newTag).toBe('');
  });

  it('should initialize with empty description when card has none', () => {
    const cardWithoutDescription: KanbanCard = {
      ...mockCard,
      description: undefined,
    };

    const { result } = renderHook(() =>
      useKanbanCardEdit({ card: cardWithoutDescription, onUpdate: mockOnUpdate })
    );

    expect(result.current.editDescription).toBe('');
  });

  it('should update title when setEditTitle is called', () => {
    const { result } = renderHook(() =>
      useKanbanCardEdit({ card: mockCard, onUpdate: mockOnUpdate })
    );

    act(() => {
      result.current.setEditTitle('Updated Title');
    });

    expect(result.current.editTitle).toBe('Updated Title');
  });

  it('should update description when setEditDescription is called', () => {
    const { result } = renderHook(() =>
      useKanbanCardEdit({ card: mockCard, onUpdate: mockOnUpdate })
    );

    act(() => {
      result.current.setEditDescription('Updated Description');
    });

    expect(result.current.editDescription).toBe('Updated Description');
  });

  it('should update priority when setEditPriority is called', () => {
    const { result } = renderHook(() =>
      useKanbanCardEdit({ card: mockCard, onUpdate: mockOnUpdate })
    );

    act(() => {
      result.current.setEditPriority('high');
    });

    expect(result.current.editPriority).toBe('high');
  });

  it('should add tag when handleAddTag is called', () => {
    const { result } = renderHook(() =>
      useKanbanCardEdit({ card: mockCard, onUpdate: mockOnUpdate })
    );

    act(() => {
      result.current.setNewTag('tag3');
    });

    act(() => {
      result.current.handleAddTag();
    });

    expect(result.current.editTags).toEqual(['tag1', 'tag2', 'tag3']);
    expect(result.current.newTag).toBe('');
  });

  it('should not add duplicate tags', () => {
    const { result } = renderHook(() =>
      useKanbanCardEdit({ card: mockCard, onUpdate: mockOnUpdate })
    );

    act(() => {
      result.current.setNewTag('tag1');
    });

    act(() => {
      result.current.handleAddTag();
    });

    expect(result.current.editTags).toEqual(['tag1', 'tag2']);
  });

  it('should not add empty tag', () => {
    const { result } = renderHook(() =>
      useKanbanCardEdit({ card: mockCard, onUpdate: mockOnUpdate })
    );

    act(() => {
      result.current.setNewTag('   ');
    });

    act(() => {
      result.current.handleAddTag();
    });

    expect(result.current.editTags).toEqual(['tag1', 'tag2']);
  });

  it('should trim whitespace when adding tag', () => {
    const { result } = renderHook(() =>
      useKanbanCardEdit({ card: mockCard, onUpdate: mockOnUpdate })
    );

    act(() => {
      result.current.setNewTag('  tag3  ');
    });

    act(() => {
      result.current.handleAddTag();
    });

    expect(result.current.editTags).toEqual(['tag1', 'tag2', 'tag3']);
  });

  it('should remove tag when handleRemoveTag is called', () => {
    const { result } = renderHook(() =>
      useKanbanCardEdit({ card: mockCard, onUpdate: mockOnUpdate })
    );

    act(() => {
      result.current.handleRemoveTag('tag1');
    });

    expect(result.current.editTags).toEqual(['tag2']);
  });

  it('should call onUpdate with correct parameters when handleSave is called', () => {
    const { result } = renderHook(() =>
      useKanbanCardEdit({ card: mockCard, onUpdate: mockOnUpdate })
    );

    act(() => {
      result.current.setEditTitle('Updated Title');
      result.current.setEditDescription('Updated Description');
      result.current.setEditPriority('high');
    });

    act(() => {
      result.current.handleSave();
    });

    expect(mockOnUpdate).toHaveBeenCalledWith('card-1', {
      title: 'Updated Title',
      description: 'Updated Description',
      priority: 'high',
      tags: ['tag1', 'tag2'],
      updatedAt: expect.any(String),
    });
  });

  it('should not save when title is empty', () => {
    const { result } = renderHook(() =>
      useKanbanCardEdit({ card: mockCard, onUpdate: mockOnUpdate })
    );

    act(() => {
      result.current.setEditTitle('');
    });

    act(() => {
      result.current.handleSave();
    });

    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('should not save when title is only whitespace', () => {
    const { result } = renderHook(() =>
      useKanbanCardEdit({ card: mockCard, onUpdate: mockOnUpdate })
    );

    act(() => {
      result.current.setEditTitle('   ');
    });

    act(() => {
      result.current.handleSave();
    });

    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('should close expanded view after save', () => {
    const { result } = renderHook(() =>
      useKanbanCardEdit({ card: mockCard, onUpdate: mockOnUpdate })
    );

    act(() => {
      result.current.handleOpen(true);
    });

    expect(result.current.isExpanded).toBe(true);

    act(() => {
      result.current.handleSave();
    });

    expect(result.current.isExpanded).toBe(false);
  });

  it('should pass undefined for empty description when saving', () => {
    const { result } = renderHook(() =>
      useKanbanCardEdit({ card: mockCard, onUpdate: mockOnUpdate })
    );

    act(() => {
      result.current.setEditDescription('   ');
    });

    act(() => {
      result.current.handleSave();
    });

    expect(mockOnUpdate).toHaveBeenCalledWith('card-1', {
      title: 'Test Card',
      description: undefined,
      priority: 'medium',
      tags: ['tag1', 'tag2'],
      updatedAt: expect.any(String),
    });
  });

  it('should pass undefined for tags when empty', () => {
    const cardWithoutTags: KanbanCard = {
      ...mockCard,
      tags: undefined,
    };

    const { result } = renderHook(() =>
      useKanbanCardEdit({ card: cardWithoutTags, onUpdate: mockOnUpdate })
    );

    act(() => {
      result.current.handleSave();
    });

    expect(mockOnUpdate).toHaveBeenCalledWith('card-1', {
      title: 'Test Card',
      description: 'Test Description',
      priority: 'medium',
      tags: undefined,
      updatedAt: expect.any(String),
    });
  });

  it('should reset state when handleOpen is called with true', () => {
    const { result } = renderHook(() =>
      useKanbanCardEdit({ card: mockCard, onUpdate: mockOnUpdate })
    );

    // Modify state
    act(() => {
      result.current.setEditTitle('Modified');
      result.current.setEditDescription('Modified Description');
      result.current.setEditPriority('low');
      result.current.setNewTag('newTag');
    });

    // Open (reset)
    act(() => {
      result.current.handleOpen(true);
    });

    expect(result.current.editTitle).toBe('Test Card');
    expect(result.current.editDescription).toBe('Test Description');
    expect(result.current.editPriority).toBe('medium');
    expect(result.current.editTags).toEqual(['tag1', 'tag2']);
    expect(result.current.newTag).toBe('');
    expect(result.current.isExpanded).toBe(true);
  });

  it('should close when handleOpen is called with false', () => {
    const { result } = renderHook(() =>
      useKanbanCardEdit({ card: mockCard, onUpdate: mockOnUpdate })
    );

    act(() => {
      result.current.handleOpen(true);
    });

    expect(result.current.isExpanded).toBe(true);

    act(() => {
      result.current.handleOpen(false);
    });

    expect(result.current.isExpanded).toBe(false);
  });

  it('should expand when handleCardDoubleClick is called', () => {
    const { result } = renderHook(() =>
      useKanbanCardEdit({ card: mockCard, onUpdate: mockOnUpdate })
    );

    expect(result.current.isExpanded).toBe(false);

    act(() => {
      result.current.handleCardDoubleClick();
    });

    expect(result.current.isExpanded).toBe(true);
  });

  it('should work without onUpdate callback', () => {
    const { result } = renderHook(() =>
      useKanbanCardEdit({ card: mockCard })
    );

    act(() => {
      result.current.setEditTitle('Updated Title');
      result.current.handleSave();
    });

    // Should not throw error
    expect(result.current.isExpanded).toBe(false);
  });

  it('should handle card prop changes', () => {
    const { result, rerender } = renderHook(
      ({ card }) => useKanbanCardEdit({ card, onUpdate: mockOnUpdate }),
      { initialProps: { card: mockCard } }
    );

    expect(result.current.editTitle).toBe('Test Card');

    // Update card prop
    const updatedCard: KanbanCard = {
      ...mockCard,
      title: 'New Card Title',
    };

    // Open to reset state with new card
    rerender({ card: updatedCard });
    act(() => {
      result.current.handleOpen(true);
    });

    expect(result.current.editTitle).toBe('New Card Title');
  });

  it('should handle priority set to undefined', () => {
    const { result } = renderHook(() =>
      useKanbanCardEdit({ card: mockCard, onUpdate: mockOnUpdate })
    );

    act(() => {
      result.current.setEditPriority(undefined);
    });

    act(() => {
      result.current.handleSave();
    });

    expect(mockOnUpdate).toHaveBeenCalledWith('card-1', {
      title: 'Test Card',
      description: 'Test Description',
      priority: undefined,
      tags: ['tag1', 'tag2'],
      updatedAt: expect.any(String),
    });
  });
});
