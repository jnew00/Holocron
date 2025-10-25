/**
 * Tests for useNotesSidebar hook
 */

import { renderHook } from '@testing-library/react';
import { useNotesSidebar } from '../useNotesSidebar';
import { RepoProvider } from '@/contexts/RepoContext';

jest.mock('@/lib/repositories');

describe('useNotesSidebar', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() =>
      useNotesSidebar(),
      {
        wrapper: RepoProvider,
      }
    );

    expect(result.current.notes).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
