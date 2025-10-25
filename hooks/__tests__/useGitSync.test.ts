/**
 * Tests for useGitSync hook
 */

import { renderHook } from '@testing-library/react';
import { useGitSync } from '../useGitSync';
import * as RepoContext from '@/contexts/RepoContext';
import * as SettingsContext from '@/contexts/SettingsContext';

jest.mock('@/lib/git/gitService');

// Mock the contexts
jest.mock('@/contexts/RepoContext', () => ({
  useRepo: jest.fn(),
}));

jest.mock('@/contexts/SettingsContext', () => ({
  useSettings: jest.fn(),
}));

describe('useGitSync', () => {
  beforeEach(() => {
    (RepoContext.useRepo as jest.Mock).mockReturnValue({
      repoPath: null,
      passphrase: null,
    });

    (SettingsContext.useSettings as jest.Mock).mockReturnValue({
      settings: {
        autoSyncEnabled: false,
        autoSyncInterval: 30,
        autoSyncScheduleEnabled: false,
        autoSyncScheduleTime: '17:00',
        autoSyncScheduleDays: [0, 1, 2, 3, 4, 5, 6],
      },
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGitSync());

    expect(result.current.open).toBe(false);
    expect(result.current.working).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.status).toBeNull();
  });
});
