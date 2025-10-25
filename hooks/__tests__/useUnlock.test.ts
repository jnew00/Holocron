/**
 * Tests for useUnlock hook
 */

import { renderHook, act } from '@testing-library/react';
import { useUnlock } from '../useUnlock';

describe('useUnlock', () => {
  const mockSetRepo = jest.fn();
  const mockRepoPath = '/test/repo';

  beforeEach(() => {
    mockSetRepo.mockClear();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useUnlock({ repoPath: mockRepoPath, setRepo: mockSetRepo })
    );

    expect(result.current.passphrase).toBe('');
    expect(result.current.error).toBe('');
    expect(result.current.loading).toBe(false);
  });

  it('should update passphrase when setPassphrase is called', () => {
    const { result } = renderHook(() =>
      useUnlock({ repoPath: mockRepoPath, setRepo: mockSetRepo })
    );

    act(() => {
      result.current.setPassphrase('new-passphrase');
    });

    expect(result.current.passphrase).toBe('new-passphrase');
  });

  it('should set error when repoPath is null', async () => {
    const { result } = renderHook(() =>
      useUnlock({ repoPath: null, setRepo: mockSetRepo })
    );

    await act(async () => {
      await result.current.handleUnlock();
    });

    expect(result.current.error).toBe('No repository found');
    expect(mockSetRepo).not.toHaveBeenCalled();
  });

  it('should set error when passphrase is empty', async () => {
    const { result } = renderHook(() =>
      useUnlock({ repoPath: mockRepoPath, setRepo: mockSetRepo })
    );

    await act(async () => {
      await result.current.handleUnlock();
    });

    expect(result.current.error).toBe('Invalid passphrase');
    expect(mockSetRepo).not.toHaveBeenCalled();
  });

  it('should set error when passphrase is too short', async () => {
    const { result } = renderHook(() =>
      useUnlock({ repoPath: mockRepoPath, setRepo: mockSetRepo })
    );

    act(() => {
      result.current.setPassphrase('short');
    });

    await act(async () => {
      await result.current.handleUnlock();
    });

    expect(result.current.error).toBe('Invalid passphrase');
    expect(mockSetRepo).not.toHaveBeenCalled();
  });

  it('should call setRepo with valid passphrase', async () => {
    const validPassphrase = 'valid-passphrase-12345';
    const { result } = renderHook(() =>
      useUnlock({ repoPath: mockRepoPath, setRepo: mockSetRepo })
    );

    act(() => {
      result.current.setPassphrase(validPassphrase);
    });

    await act(async () => {
      await result.current.handleUnlock();
    });

    expect(result.current.error).toBe('');
    expect(mockSetRepo).toHaveBeenCalledWith(mockRepoPath, validPassphrase);
  });

  it('should set loading to true during unlock and false after', async () => {
    const { result } = renderHook(() =>
      useUnlock({ repoPath: mockRepoPath, setRepo: mockSetRepo })
    );

    act(() => {
      result.current.setPassphrase('valid-passphrase-12345');
    });

    let loadingDuringUnlock = false;

    await act(async () => {
      const unlockPromise = result.current.handleUnlock();
      loadingDuringUnlock = result.current.loading;
      await unlockPromise;
    });

    // Loading should have been true during unlock
    expect(loadingDuringUnlock).toBe(true);
    // Loading should be false after unlock
    expect(result.current.loading).toBe(false);
  });

  it('should clear error when attempting unlock with valid passphrase', async () => {
    const { result } = renderHook(() =>
      useUnlock({ repoPath: mockRepoPath, setRepo: mockSetRepo })
    );

    // First, create an error
    await act(async () => {
      await result.current.handleUnlock();
    });
    expect(result.current.error).toBe('Invalid passphrase');

    // Then, unlock with valid passphrase
    act(() => {
      result.current.setPassphrase('valid-passphrase-12345');
    });

    await act(async () => {
      await result.current.handleUnlock();
    });

    expect(result.current.error).toBe('');
  });

  it('should handle keyboard Enter key to trigger unlock', async () => {
    const { result } = renderHook(() =>
      useUnlock({ repoPath: mockRepoPath, setRepo: mockSetRepo })
    );

    act(() => {
      result.current.setPassphrase('valid-passphrase-12345');
    });

    const mockEvent = {
      key: 'Enter',
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent;

    await act(async () => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(mockSetRepo).toHaveBeenCalledWith(mockRepoPath, 'valid-passphrase-12345');
  });

  it('should not trigger unlock on other keys', async () => {
    const { result } = renderHook(() =>
      useUnlock({ repoPath: mockRepoPath, setRepo: mockSetRepo })
    );

    act(() => {
      result.current.setPassphrase('valid-passphrase-12345');
    });

    const mockEvent = {
      key: 'Escape',
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(mockSetRepo).not.toHaveBeenCalled();
  });

  it('should handle setRepo errors gracefully', async () => {
    const errorMessage = 'Unlock failed';
    const mockSetRepoWithError = jest.fn(() => {
      throw new Error(errorMessage);
    });

    const { result } = renderHook(() =>
      useUnlock({ repoPath: mockRepoPath, setRepo: mockSetRepoWithError })
    );

    act(() => {
      result.current.setPassphrase('valid-passphrase-12345');
    });

    await act(async () => {
      await result.current.handleUnlock();
    });

    expect(result.current.error).toBe(`Failed to unlock: ${errorMessage}`);
    expect(result.current.loading).toBe(false);
  });

  it('should accept passphrase with exactly 8 characters', async () => {
    const { result } = renderHook(() =>
      useUnlock({ repoPath: mockRepoPath, setRepo: mockSetRepo })
    );

    act(() => {
      result.current.setPassphrase('12345678');
    });

    await act(async () => {
      await result.current.handleUnlock();
    });

    expect(result.current.error).toBe('');
    expect(mockSetRepo).toHaveBeenCalled();
  });

  it('should handle repoPath changes', async () => {
    const { result, rerender } = renderHook(
      ({ repoPath, setRepo }) => useUnlock({ repoPath, setRepo }),
      {
        initialProps: {
          repoPath: '/initial/path',
          setRepo: mockSetRepo,
        },
      }
    );

    act(() => {
      result.current.setPassphrase('valid-passphrase-12345');
    });

    // Unlock with initial path
    await act(async () => {
      await result.current.handleUnlock();
    });
    expect(mockSetRepo).toHaveBeenCalledWith('/initial/path', 'valid-passphrase-12345');

    // Change repo path
    mockSetRepo.mockClear();
    rerender({ repoPath: '/updated/path', setRepo: mockSetRepo });

    // Unlock with updated path
    await act(async () => {
      await result.current.handleUnlock();
    });
    expect(mockSetRepo).toHaveBeenCalledWith('/updated/path', 'valid-passphrase-12345');
  });
});
