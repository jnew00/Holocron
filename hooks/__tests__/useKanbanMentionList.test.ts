/**
 * Tests for useKanbanMentionList hook
 */

import { renderHook, act } from '@testing-library/react';
import { useKanbanMentionList } from '../useKanbanMentionList';
import { KanbanMentionItem } from '@/lib/editor/kanbanSuggestions';
import { createRef } from 'react';

describe('useKanbanMentionList', () => {
  const mockItems: KanbanMentionItem[] = [
    { id: 'item-1', label: 'Item 1', description: 'Description 1', type: 'board' },
    { id: 'item-2', label: 'Item 2', description: 'Description 2', type: 'board' },
    { id: 'item-3', label: 'Item 3', description: 'Description 3', type: 'board' },
  ];

  const mockCommand = jest.fn();

  beforeEach(() => {
    mockCommand.mockClear();
  });

  it('should initialize with selectedIndex 0', () => {
    const ref = createRef();
    const { result } = renderHook(() =>
      useKanbanMentionList({ items: mockItems, command: mockCommand, ref })
    );

    expect(result.current.selectedIndex).toBe(0);
  });

  it('should call command with selected item when selectItem is called', () => {
    const ref = createRef();
    const { result } = renderHook(() =>
      useKanbanMentionList({ items: mockItems, command: mockCommand, ref })
    );

    act(() => {
      result.current.selectItem(1);
    });

    expect(mockCommand).toHaveBeenCalledWith(mockItems[1]);
  });

  it('should not call command when selecting invalid index', () => {
    const ref = createRef();
    const { result } = renderHook(() =>
      useKanbanMentionList({ items: mockItems, command: mockCommand, ref })
    );

    act(() => {
      result.current.selectItem(10);
    });

    expect(mockCommand).not.toHaveBeenCalled();
  });

  it('should handle ArrowDown key navigation', () => {
    const ref = createRef<any>();
    renderHook(() =>
      useKanbanMentionList({ items: mockItems, command: mockCommand, ref })
    );

    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    let handled: boolean;
    act(() => {
      handled = ref.current.onKeyDown({ event });
    });

    expect(handled!).toBe(true);
  });

  it('should handle ArrowUp key navigation', () => {
    const ref = createRef<any>();
    renderHook(() =>
      useKanbanMentionList({ items: mockItems, command: mockCommand, ref })
    );

    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    let handled: boolean;
    act(() => {
      handled = ref.current.onKeyDown({ event });
    });

    expect(handled!).toBe(true);
  });

  it('should handle Enter key to select item', () => {
    const ref = createRef<any>();
    renderHook(() =>
      useKanbanMentionList({ items: mockItems, command: mockCommand, ref })
    );

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    const handled = ref.current.onKeyDown({ event });

    expect(handled).toBe(true);
    expect(mockCommand).toHaveBeenCalledWith(mockItems[0]);
  });

  it('should not handle other keys', () => {
    const ref = createRef<any>();
    renderHook(() =>
      useKanbanMentionList({ items: mockItems, command: mockCommand, ref })
    );

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    const handled = ref.current.onKeyDown({ event });

    expect(handled).toBe(false);
  });

  it('should cycle through items with ArrowDown', () => {
    const ref = createRef<any>();
    const { result } = renderHook(() =>
      useKanbanMentionList({ items: mockItems, command: mockCommand, ref })
    );

    expect(result.current.selectedIndex).toBe(0);

    // Press ArrowDown
    act(() => {
      ref.current.onKeyDown({ event: new KeyboardEvent('keydown', { key: 'ArrowDown' }) });
    });
    expect(result.current.selectedIndex).toBe(1);

    // Press ArrowDown again
    act(() => {
      ref.current.onKeyDown({ event: new KeyboardEvent('keydown', { key: 'ArrowDown' }) });
    });
    expect(result.current.selectedIndex).toBe(2);

    // Wrap around to beginning
    act(() => {
      ref.current.onKeyDown({ event: new KeyboardEvent('keydown', { key: 'ArrowDown' }) });
    });
    expect(result.current.selectedIndex).toBe(0);
  });

  it('should cycle through items with ArrowUp', () => {
    const ref = createRef<any>();
    const { result } = renderHook(() =>
      useKanbanMentionList({ items: mockItems, command: mockCommand, ref })
    );

    expect(result.current.selectedIndex).toBe(0);

    // Press ArrowUp (should wrap to end)
    act(() => {
      ref.current.onKeyDown({ event: new KeyboardEvent('keydown', { key: 'ArrowUp' }) });
    });
    expect(result.current.selectedIndex).toBe(2);

    // Press ArrowUp again
    act(() => {
      ref.current.onKeyDown({ event: new KeyboardEvent('keydown', { key: 'ArrowUp' }) });
    });
    expect(result.current.selectedIndex).toBe(1);
  });

  it('should reset selectedIndex to 0 when items change', () => {
    const ref = createRef<any>();
    const { result, rerender } = renderHook(
      ({ items }) => useKanbanMentionList({ items, command: mockCommand, ref }),
      { initialProps: { items: mockItems } }
    );

    // Navigate to item 2
    act(() => {
      ref.current.onKeyDown({ event: new KeyboardEvent('keydown', { key: 'ArrowDown' }) });
    });
    act(() => {
      ref.current.onKeyDown({ event: new KeyboardEvent('keydown', { key: 'ArrowDown' }) });
    });
    expect(result.current.selectedIndex).toBe(2);

    // Change items
    const newItems: KanbanMentionItem[] = [
      { id: 'new-1', label: 'New Item 1', description: 'Description', type: 'board' },
      { id: 'new-2', label: 'New Item 2', description: 'Description', type: 'board' },
    ];

    rerender({ items: newItems });

    expect(result.current.selectedIndex).toBe(0);
  });

  it('should handle single item list', () => {
    const ref = createRef<any>();
    const singleItem: KanbanMentionItem[] = [{ id: 'item-1', label: 'Item 1', description: 'Description', type: 'board' }];
    const { result } = renderHook(() =>
      useKanbanMentionList({ items: singleItem, command: mockCommand, ref })
    );

    expect(result.current.selectedIndex).toBe(0);

    // ArrowDown should stay at 0
    act(() => {
      ref.current.onKeyDown({ event: new KeyboardEvent('keydown', { key: 'ArrowDown' }) });
    });
    expect(result.current.selectedIndex).toBe(0);

    // ArrowUp should stay at 0
    act(() => {
      ref.current.onKeyDown({ event: new KeyboardEvent('keydown', { key: 'ArrowUp' }) });
    });
    expect(result.current.selectedIndex).toBe(0);
  });

  it('should handle empty items list', () => {
    const ref = createRef<any>();
    const { result } = renderHook(() =>
      useKanbanMentionList({ items: [], command: mockCommand, ref })
    );

    expect(result.current.selectedIndex).toBe(0);

    // Should handle navigation without errors
    act(() => {
      ref.current.onKeyDown({ event: new KeyboardEvent('keydown', { key: 'ArrowDown' }) });
    });

    // Should not call command on Enter with empty list
    act(() => {
      ref.current.onKeyDown({ event: new KeyboardEvent('keydown', { key: 'Enter' }) });
    });
    expect(mockCommand).not.toHaveBeenCalled();
  });

  it('should select correct item after navigation when Enter is pressed', () => {
    const ref = createRef<any>();
    renderHook(() =>
      useKanbanMentionList({ items: mockItems, command: mockCommand, ref })
    );

    // Navigate to item 2
    act(() => {
      ref.current.onKeyDown({ event: new KeyboardEvent('keydown', { key: 'ArrowDown' }) });
    });
    act(() => {
      ref.current.onKeyDown({ event: new KeyboardEvent('keydown', { key: 'ArrowDown' }) });
    });

    // Press Enter
    act(() => {
      ref.current.onKeyDown({ event: new KeyboardEvent('keydown', { key: 'Enter' }) });
    });

    expect(mockCommand).toHaveBeenCalledWith(mockItems[2]);
  });

  it('should update when command prop changes', () => {
    const ref = createRef<any>();
    const newCommand = jest.fn();

    const { rerender } = renderHook(
      ({ command }) => useKanbanMentionList({ items: mockItems, command, ref }),
      { initialProps: { command: mockCommand } }
    );

    // Change command
    rerender({ command: newCommand });

    // Select item
    act(() => {
      ref.current.onKeyDown({ event: new KeyboardEvent('keydown', { key: 'Enter' }) });
    });

    expect(newCommand).toHaveBeenCalledWith(mockItems[0]);
    expect(mockCommand).not.toHaveBeenCalled();
  });

  it('should work with different item structures', () => {
    const ref = createRef<any>();
    const customItems: KanbanMentionItem[] = [
      { id: 'board-1', label: 'Board 1', description: 'A board', type: 'board' },
      { id: 'card-1', label: 'Card 1', description: 'A column', type: 'board-column' },
    ];

    renderHook(() =>
      useKanbanMentionList({ items: customItems, command: mockCommand, ref })
    );

    act(() => {
      ref.current.onKeyDown({ event: new KeyboardEvent('keydown', { key: 'Enter' }) });
    });

    expect(mockCommand).toHaveBeenCalledWith(customItems[0]);
  });
});
