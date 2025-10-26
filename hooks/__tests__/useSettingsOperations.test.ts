/**
 * Tests for useSettingsOperations hook
 */

import { renderHook } from '@testing-library/react';
import { useSettingsOperations } from '../useSettingsOperations';
import { useSettings } from '@/contexts/SettingsContext';
import { useRepo } from '@/contexts/RepoContext';

jest.mock('@/contexts/SettingsContext');
jest.mock('@/contexts/RepoContext');
jest.mock('@/lib/repositories');

describe('useSettingsOperations', () => {
  beforeEach(() => {
    (useSettings as jest.Mock).mockReturnValue({
      settings: {},
      updateSettings: jest.fn(),
    });
    (useRepo as jest.Mock).mockReturnValue({
      repoPath: '/test/repo',
      setRepoPath: jest.fn(),
      getDEK: jest.fn(() => 'dGVzdC1kZWstYmFzZTY0'),
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSettingsOperations());

    expect(result.current.saved).toBe(false);
    expect(result.current.dekSaved).toBe(false);
  });
});
