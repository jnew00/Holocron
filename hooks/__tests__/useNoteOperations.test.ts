/**
 * Tests for useNoteOperations hook
 */

import { renderHook } from '@testing-library/react';
import { useNoteOperations } from '../useNoteOperations';

jest.mock('@/lib/repositories');

describe('useNoteOperations', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() =>
      useNoteOperations({
        repoPath: null,
        passphrase: null,
        currentNotePath: null,
        onNoteChange: jest.fn(),
      })
    );

    expect(result.current.content).toBe('');
    expect(result.current.metadata).toEqual({});
  });
});
