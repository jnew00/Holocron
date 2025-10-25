/**
 * Tests for useKanbanSync hook
 */

import { renderHook } from '@testing-library/react';
import { useKanbanSync } from '../useKanbanSync';

describe('useKanbanSync', () => {
  const mockOnSync = jest.fn();

  beforeEach(() => {
    mockOnSync.mockClear();
  });

  it('should trigger sync when switching to kanban tab', () => {
    const { rerender } = renderHook(
      ({ activeTab }) => useKanbanSync({ activeTab, onSync: mockOnSync }),
      { initialProps: { activeTab: 'notes' } }
    );

    expect(mockOnSync).not.toHaveBeenCalled();

    // Switch to kanban tab
    rerender({ activeTab: 'kanban-board-1' });

    expect(mockOnSync).toHaveBeenCalledTimes(1);
  });

  it('should not trigger sync when staying on non-kanban tab', () => {
    const { rerender } = renderHook(
      ({ activeTab }) => useKanbanSync({ activeTab, onSync: mockOnSync }),
      { initialProps: { activeTab: 'notes' } }
    );

    rerender({ activeTab: 'settings' });

    expect(mockOnSync).not.toHaveBeenCalled();
  });
});
