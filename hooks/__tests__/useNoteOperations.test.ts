/**
 * Tests for useNoteOperations hook
 */

import { renderHook } from '@testing-library/react';
import { useNoteOperations } from '../useNoteOperations';

jest.mock('@/lib/repositories');

describe('useNoteOperations', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() =>
      useNoteOperations(null)
    );

    expect(result.current.markdown).toBe('');
    expect(result.current.noteFrontmatter).toEqual({});
    expect(result.current.currentNote).toBeNull();
  });
});
