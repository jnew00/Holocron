/**
 * Tests for useScheduledSync hook
 */

import { renderHook, act } from '@testing-library/react';
import { useScheduledSync } from '../useScheduledSync';
import { performAutoSync } from '@/lib/git/performAutoSync';

// Mock the performAutoSync function
jest.mock('@/lib/git/performAutoSync', () => ({
  performAutoSync: jest.fn(),
}));

describe('useScheduledSync', () => {
  const mockPerformAutoSync = performAutoSync as jest.MockedFunction<typeof performAutoSync>;

  // Save original Date
  const RealDate = Date;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    global.Date = RealDate;
  });

  const defaultProps = {
    enabled: true,
    scheduleTime: '17:00',
    scheduleDays: [0, 1, 2, 3, 4, 5, 6], // Every day
    repoPath: '/test/repo',
    passphrase: 'test-passphrase',
    isUnlocked: true,
  };

  const mockDate = (dateString: string) => {
    const mockNow = new Date(dateString);
    global.Date = class extends RealDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          return mockNow as any;
        }
        return new RealDate(...args) as any;
      }

      static now() {
        return mockNow.getTime();
      }
    } as any;
  };

  it('should not set up sync when disabled', () => {
    renderHook(() =>
      useScheduledSync({
        ...defaultProps,
        enabled: false,
      })
    );

    act(() => {
      jest.advanceTimersByTime(2 * 60 * 1000);
    });

    expect(mockPerformAutoSync).not.toHaveBeenCalled();
  });

  it('should not set up sync when repoPath is null', () => {
    renderHook(() =>
      useScheduledSync({
        ...defaultProps,
        repoPath: null,
      })
    );

    act(() => {
      jest.advanceTimersByTime(2 * 60 * 1000);
    });

    expect(mockPerformAutoSync).not.toHaveBeenCalled();
  });

  it('should not set up sync when passphrase is null', () => {
    renderHook(() =>
      useScheduledSync({
        ...defaultProps,
        passphrase: null,
      })
    );

    act(() => {
      jest.advanceTimersByTime(2 * 60 * 1000);
    });

    expect(mockPerformAutoSync).not.toHaveBeenCalled();
  });

  it('should not set up sync when not unlocked', () => {
    renderHook(() =>
      useScheduledSync({
        ...defaultProps,
        isUnlocked: false,
      })
    );

    act(() => {
      jest.advanceTimersByTime(2 * 60 * 1000);
    });

    expect(mockPerformAutoSync).not.toHaveBeenCalled();
  });

  it('should not set up sync when scheduleDays is empty', () => {
    renderHook(() =>
      useScheduledSync({
        ...defaultProps,
        scheduleDays: [],
      })
    );

    act(() => {
      jest.advanceTimersByTime(2 * 60 * 1000);
    });

    expect(mockPerformAutoSync).not.toHaveBeenCalled();
  });

  it('should perform sync at scheduled time on scheduled day', async () => {
    // Mock date to Wednesday at 17:00
    mockDate('2025-01-15T17:00:00'); // Wednesday

    mockPerformAutoSync.mockResolvedValue();

    renderHook(() =>
      useScheduledSync({
        ...defaultProps,
        scheduleTime: '17:00',
        scheduleDays: [3], // Wednesday only
      })
    );

    // Check runs immediately
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockPerformAutoSync).toHaveBeenCalledWith({
      repoPath: '/test/repo',
      passphrase: 'test-passphrase',
      messagePrefix: 'Scheduled sync',
    });
  });

  it('should not sync at scheduled time on non-scheduled day', async () => {
    // Mock date to Wednesday at 17:00
    mockDate('2025-01-15T17:00:00'); // Wednesday

    mockPerformAutoSync.mockResolvedValue();

    renderHook(() =>
      useScheduledSync({
        ...defaultProps,
        scheduleTime: '17:00',
        scheduleDays: [1, 2], // Monday and Tuesday only
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockPerformAutoSync).not.toHaveBeenCalled();
  });

  it('should not sync at wrong time on scheduled day', async () => {
    // Mock date to Wednesday at 16:59
    mockDate('2025-01-15T16:59:00'); // Wednesday

    mockPerformAutoSync.mockResolvedValue();

    renderHook(() =>
      useScheduledSync({
        ...defaultProps,
        scheduleTime: '17:00',
        scheduleDays: [3], // Wednesday
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockPerformAutoSync).not.toHaveBeenCalled();
  });

  it('should not sync twice on the same day', async () => {
    // Mock date to Wednesday at 17:00
    mockDate('2025-01-15T17:00:00'); // Wednesday

    mockPerformAutoSync.mockResolvedValue();

    renderHook(() =>
      useScheduledSync({
        ...defaultProps,
        scheduleTime: '17:00',
        scheduleDays: [3], // Wednesday
      })
    );

    // First check should sync
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockPerformAutoSync).toHaveBeenCalledTimes(1);

    mockPerformAutoSync.mockClear();

    // Fast-forward 60 seconds (still same day and time)
    await act(async () => {
      jest.advanceTimersByTime(60000);
      await Promise.resolve();
    });

    // Should not sync again
    expect(mockPerformAutoSync).not.toHaveBeenCalled();
  });

  it('should check every minute', async () => {
    // Mock date to non-scheduled time
    mockDate('2025-01-15T16:00:00');

    mockPerformAutoSync.mockResolvedValue();

    renderHook(() =>
      useScheduledSync({
        ...defaultProps,
        scheduleTime: '17:00',
      })
    );

    // Initial check
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockPerformAutoSync).not.toHaveBeenCalled();

    // Fast-forward 1 minute
    await act(async () => {
      jest.advanceTimersByTime(60000);
      await Promise.resolve();
    });

    // Still not scheduled time
    expect(mockPerformAutoSync).not.toHaveBeenCalled();
  });

  it('should handle sync errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockDate('2025-01-15T17:00:00');

    mockPerformAutoSync.mockRejectedValue(new Error('Sync failed'));

    renderHook(() =>
      useScheduledSync({
        ...defaultProps,
        scheduleTime: '17:00',
        scheduleDays: [3], // Wednesday
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[AutoSync] Scheduled sync failed:',
      'Sync failed'
    );

    consoleErrorSpy.mockRestore();
  });

  it('should clear timer on unmount', () => {
    mockDate('2025-01-15T17:00:00');
    mockPerformAutoSync.mockResolvedValue();

    const { unmount } = renderHook(() =>
      useScheduledSync({
        ...defaultProps,
        scheduleTime: '17:00',
        scheduleDays: [3],
      })
    );

    unmount();

    // Fast-forward time after unmount
    act(() => {
      jest.advanceTimersByTime(10 * 60 * 1000);
    });

    // Should only have been called once (on mount), not on interval
    expect(mockPerformAutoSync).toHaveBeenCalledTimes(1);
  });

  it('should restart when schedule settings change', async () => {
    mockDate('2025-01-15T17:00:00');
    mockPerformAutoSync.mockResolvedValue();

    const { rerender } = renderHook(
      ({ scheduleTime, scheduleDays }) =>
        useScheduledSync({ ...defaultProps, scheduleTime, scheduleDays }),
      {
        initialProps: {
          scheduleTime: '17:00',
          scheduleDays: [3], // Wednesday
        },
      }
    );

    // Initial sync
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockPerformAutoSync).toHaveBeenCalledTimes(1);
    mockPerformAutoSync.mockClear();

    // Change schedule to different day
    rerender({
      scheduleTime: '17:00',
      scheduleDays: [1, 2], // Monday and Tuesday only
    });

    await act(async () => {
      await Promise.resolve();
    });

    // Should not sync on Wednesday anymore
    expect(mockPerformAutoSync).not.toHaveBeenCalled();
  });

  it('should handle multiple scheduled days', async () => {
    // Mock date to Monday at 17:00
    mockDate('2025-01-13T17:00:00'); // Monday

    mockPerformAutoSync.mockResolvedValue();

    renderHook(() =>
      useScheduledSync({
        ...defaultProps,
        scheduleTime: '17:00',
        scheduleDays: [1, 3, 5], // Monday, Wednesday, Friday
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockPerformAutoSync).toHaveBeenCalled();
  });

  it('should handle morning time (single digit hour)', async () => {
    // Mock date to 09:00
    mockDate('2025-01-15T09:00:00');

    mockPerformAutoSync.mockResolvedValue();

    renderHook(() =>
      useScheduledSync({
        ...defaultProps,
        scheduleTime: '09:00',
        scheduleDays: [3], // Wednesday
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockPerformAutoSync).toHaveBeenCalled();
  });

  it('should log setup message', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    renderHook(() => useScheduledSync(defaultProps));

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[AutoSync] Setting up scheduled sync at 17:00 on days: 0, 1, 2, 3, 4, 5, 6'
    );

    consoleLogSpy.mockRestore();
  });

  it('should log successful sync completion', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    mockDate('2025-01-15T17:00:00');
    mockPerformAutoSync.mockResolvedValue();

    renderHook(() =>
      useScheduledSync({
        ...defaultProps,
        scheduleTime: '17:00',
        scheduleDays: [3],
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[AutoSync] Scheduled sync completed successfully'
    );

    consoleLogSpy.mockRestore();
  });
});
