/**
 * Tests for useTemplateManager hook
 */

import { renderHook } from '@testing-library/react';
import { useTemplateManager } from '../useTemplateManager';

describe('useTemplateManager', () => {
  it('should initialize with empty state', () => {
    const { result } = renderHook(() =>
      useTemplateManager(null, null, false)
    );

    expect(result.current.customTemplates).toEqual([]);
  });
});
