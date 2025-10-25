/**
 * Tests for useAutoSync hook
 */

import { renderHook, act } from '@testing-library/react';
import { useAutoSync } from '../useAutoSync';
import { performAutoSync } from '@/lib/git/performAutoSync';

// Mock the performAutoSync function
jest.mock('@/lib/git/performAutoSync', () => ({
  performAutoSync: jest.fn(),
}));

describe('useAutoSync', () => {
  const mockPerformAutoSync = performAutoSync as jest.MockedFunction<typeof performAutoSync>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const defaultProps = {
    enabled: true,
    interval: 30,
    repoPath: '/test/repo',
    passphrase: 'test-passphrase',
    isUnlocked: true,
  };

  it('should not set up sync when disabled', () => {
    renderHook(() =>
      useAutoSync({
        ...defaultProps,
        enabled: false,
      })
    );

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(35 * 60 * 1000);
    });

    expect(mockPerformAutoSync).not.toHaveBeenCalled();
  });

  it('should not set up sync when repoPath is null', () => {
    renderHook(() =>
      useAutoSync({
        ...defaultProps,
        repoPath: null,
      })
    );

    act(() => {
      jest.advanceTimersByTime(35 * 60 * 1000);
    });

    expect(mockPerformAutoSync).not.toHaveBeenCalled();
  });

  it('should not set up sync when passphrase is null', () => {
    renderHook(() =>
      useAutoSync({
        ...defaultProps,
        passphrase: null,
      })
    );

    act(() => {
      jest.advanceTimersByTime(35 * 60 * 1000);
    });

    expect(mockPerformAutoSync).not.toHaveBeenCalled();
  });

  it('should not set up sync when not unlocked', () => {
    renderHook(() =>
      useAutoSync({
        ...defaultProps,
        isUnlocked: false,
      })
    );

    act(() => {
      jest.advanceTimersByTime(35 * 60 * 1000);
    });

    expect(mockPerformAutoSync).not.toHaveBeenCalled();
  });

  it('should perform initial sync after 10 seconds', async () => {
    mockPerformAutoSync.mockResolvedValue();

    renderHook(() => useAutoSync(defaultProps));

    // Fast-forward 10 seconds
    await act(async () => {
      jest.advanceTimersByTime(10000);
      await Promise.resolve();
    });

    expect(mockPerformAutoSync).toHaveBeenCalledWith({
      repoPath: '/test/repo',
      passphrase: 'test-passphrase',
      messagePrefix: 'Auto-sync',
    });
  });

  it('should perform sync at regular intervals', async () => {
    mockPerformAutoSync.mockResolvedValue();

    renderHook(() => useAutoSync(defaultProps));

    // Initial sync after 10 seconds
    await act(async () => {
      jest.advanceTimersByTime(10000);
      await Promise.resolve();
    });

    expect(mockPerformAutoSync).toHaveBeenCalledTimes(1);

    // First interval sync (30 minutes)
    await act(async () => {
      jest.advanceTimersByTime(30 * 60 * 1000);
      await Promise.resolve();
    });

    expect(mockPerformAutoSync).toHaveBeenCalledTimes(2);

    // Second interval sync
    await act(async () => {
      jest.advanceTimersByTime(30 * 60 * 1000);
      await Promise.resolve();
    });

    expect(mockPerformAutoSync).toHaveBeenCalledTimes(3);
  });

  it('should handle sync errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockPerformAutoSync.mockRejectedValue(new Error('Sync failed'));

    renderHook(() => useAutoSync(defaultProps));

    await act(async () => {
      jest.advanceTimersByTime(10000);
      await Promise.resolve();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[AutoSync] Sync failed:',
      'Sync failed'
    );

    consoleErrorSpy.mockRestore();
  });

  it('should prevent multiple syncs running at once', async () => {
    let resolveSync: () => void;
    const syncPromise = new Promise<void>((resolve) => {
      resolveSync = resolve;
    });

    mockPerformAutoSync.mockReturnValue(syncPromise);

    renderHook(() => useAutoSync(defaultProps));

    // Start initial sync
    await act(async () => {
      jest.advanceTimersByTime(10000);
      await Promise.resolve();
    });

    expect(mockPerformAutoSync).toHaveBeenCalledTimes(1);

    // Try to trigger another sync within 60 seconds
    await act(async () => {
      jest.advanceTimersByTime(30000); // 30 seconds
      await Promise.resolve();
    });

    // Should still be only 1 call (prevented by debounce)
    expect(mockPerformAutoSync).toHaveBeenCalledTimes(1);

    // Resolve the sync
    act(() => {
      resolveSync!();
    });
  });

  it('should clear timers on unmount', () => {
    const { unmount } = renderHook(() => useAutoSync(defaultProps));

    unmount();

    // Fast-forward time after unmount
    act(() => {
      jest.advanceTimersByTime(100 * 60 * 1000);
    });

    expect(mockPerformAutoSync).not.toHaveBeenCalled();
  });

  it('should restart sync when interval changes', async () => {
    mockPerformAutoSync.mockResolvedValue();

    const { rerender } = renderHook(
      ({ interval }) => useAutoSync({ ...defaultProps, interval }),
      { initialProps: { interval: 30 } }
    );

    // Initial sync
    await act(async () => {
      jest.advanceTimersByTime(10000);
      await Promise.resolve();
    });

    mockPerformAutoSync.mockClear();

    // Change interval to 60 minutes
    rerender({ interval: 60 });

    // Fast-forward 30 minutes (old interval) - should not sync
    await act(async () => {
      jest.advanceTimersByTime(30 * 60 * 1000);
      await Promise.resolve();
    });

    expect(mockPerformAutoSync).not.toHaveBeenCalled();

    // Fast-forward another 30 minutes (total 60) - should sync
    await act(async () => {
      jest.advanceTimersByTime(30 * 60 * 1000);
      await Promise.resolve();
    });

    expect(mockPerformAutoSync).toHaveBeenCalled();
  });

  it('should stop sync when disabled after being enabled', async () => {
    mockPerformAutoSync.mockResolvedValue();

    const { rerender } = renderHook(
      ({ enabled }) => useAutoSync({ ...defaultProps, enabled }),
      { initialProps: { enabled: true } }
    );

    // Initial sync
    await act(async () => {
      jest.advanceTimersByTime(10000);
      await Promise.resolve();
    });

    expect(mockPerformAutoSync).toHaveBeenCalledTimes(1);

    // Disable
    mockPerformAutoSync.mockClear();
    rerender({ enabled: false });

    // Fast-forward - should not sync
    await act(async () => {
      jest.advanceTimersByTime(100 * 60 * 1000);
      await Promise.resolve();
    });

    expect(mockPerformAutoSync).not.toHaveBeenCalled();
  });

  it('should start sync when enabled after being disabled', async () => {
    mockPerformAutoSync.mockResolvedValue();

    const { rerender } = renderHook(
      ({ enabled }) => useAutoSync({ ...defaultProps, enabled }),
      { initialProps: { enabled: false } }
    );

    // Should not sync when disabled
    await act(async () => {
      jest.advanceTimersByTime(15000);
      await Promise.resolve();
    });

    expect(mockPerformAutoSync).not.toHaveBeenCalled();

    // Enable
    rerender({ enabled: true });

    // Should perform initial sync after 10 seconds
    await act(async () => {
      jest.advanceTimersByTime(10000);
      await Promise.resolve();
    });

    expect(mockPerformAutoSync).toHaveBeenCalled();
  });

  it('should log setup message', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    renderHook(() => useAutoSync(defaultProps));

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[AutoSync] Setting up auto-sync every 30 minutes'
    );

    consoleLogSpy.mockRestore();
  });

  it('should handle repoPath changes', async () => {
    mockPerformAutoSync.mockResolvedValue();

    const { rerender } = renderHook(
      ({ repoPath }) => useAutoSync({ ...defaultProps, repoPath }),
      { initialProps: { repoPath: '/test/repo1' } }
    );

    // Initial sync
    await act(async () => {
      jest.advanceTimersByTime(10000);
      await Promise.resolve();
    });

    expect(mockPerformAutoSync).toHaveBeenCalledWith({
      repoPath: '/test/repo1',
      passphrase: 'test-passphrase',
      messagePrefix: 'Auto-sync',
    });

    mockPerformAutoSync.mockClear();

    // Advance time past the cooldown period (60 seconds)
    await act(async () => {
      jest.advanceTimersByTime(60000);
      await Promise.resolve();
    });

    // Change repo path
    await act(async () => {
      rerender({ repoPath: '/test/repo2' });
      await Promise.resolve();
    });

    // Should sync with new repo path after 10 seconds
    await act(async () => {
      jest.advanceTimersByTime(10000);
      await Promise.resolve();
    });

    expect(mockPerformAutoSync).toHaveBeenCalledWith({
      repoPath: '/test/repo2',
      passphrase: 'test-passphrase',
      messagePrefix: 'Auto-sync',
    });
  });
});
