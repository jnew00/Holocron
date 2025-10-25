/**
 * Tests for useIconUpload hook
 */

import { renderHook } from '@testing-library/react';
import { useIconUpload } from '../useIconUpload';

describe('useIconUpload', () => {
  it('should initialize with handleIconUpload function', () => {
    const mockOnIconChange = jest.fn();
    const { result } = renderHook(() =>
      useIconUpload({ onIconChange: mockOnIconChange })
    );

    expect(result.current.handleIconUpload).toBeInstanceOf(Function);
  });
});
