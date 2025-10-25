/**
 * Tests for useWizardSetup hook
 */

import { renderHook } from '@testing-library/react';
import { useWizardSetup } from '../useWizardSetup';
import { RepoProvider } from '@/contexts/RepoContext';

describe('useWizardSetup', () => {
  it('should initialize with step 0', () => {
    const { result } = renderHook(() => useWizardSetup(), {
      wrapper: RepoProvider,
    });

    expect(result.current.step).toBe('select-directory');
  });
});
