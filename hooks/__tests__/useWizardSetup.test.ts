/**
 * Tests for useWizardSetup hook
 */

import { renderHook } from '@testing-library/react';
import { useWizardSetup } from '../useWizardSetup';

jest.mock('@/contexts/RepoContext');

describe('useWizardSetup', () => {
  it('should initialize with step 0', () => {
    const { result } = renderHook(() => useWizardSetup());

    expect(result.current.step).toBe(0);
  });
});
