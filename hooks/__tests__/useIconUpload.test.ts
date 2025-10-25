/**
 * Tests for useIconUpload hook
 */

import { renderHook } from '@testing-library/react';
import { useIconUpload } from '../useIconUpload';

describe('useIconUpload', () => {
  it('should initialize with null icon', () => {
    const mockOnIconSelect = jest.fn();
    const { result } = renderHook(() =>
      useIconUpload(mockOnIconSelect)
    );

    expect(result.current.selectedIcon).toBeNull();
  });
});
