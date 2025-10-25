/**
 * Tests for useNotesSidebar hook
 */

import { renderHook } from '@testing-library/react';
import { useNotesSidebar } from '../useNotesSidebar';

jest.mock('@/lib/repositories');

describe('useNotesSidebar', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() =>
      useNotesSidebar({
        repoPath: null,
        passphrase: null,
      })
    );

    expect(result.current.notes).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });
});
