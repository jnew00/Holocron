/**
 * Tests for useCodeBlockCopy hook
 */

import { renderHook, act } from '@testing-library/react';
import { useCodeBlockCopy } from '../useCodeBlockCopy';

describe('useCodeBlockCopy', () => {
  let mockClipboard: { writeText: jest.Mock };

  beforeEach(() => {
    // Mock navigator.clipboard
    mockClipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true,
    });

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should initialize with copied as false', () => {
    const { result } = renderHook(() => useCodeBlockCopy('test code'));

    expect(result.current.copied).toBe(false);
  });

  it('should copy text to clipboard when copyToClipboard is called', async () => {
    const testContent = 'console.log("Hello, World!");';
    const { result } = renderHook(() => useCodeBlockCopy(testContent));

    await act(async () => {
      await result.current.copyToClipboard();
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith(testContent);
  });

  it('should set copied to true after successful copy', async () => {
    const { result } = renderHook(() => useCodeBlockCopy('test code'));

    await act(async () => {
      await result.current.copyToClipboard();
    });

    expect(result.current.copied).toBe(true);
  });

  it('should reset copied to false after 2 seconds', async () => {
    const { result } = renderHook(() => useCodeBlockCopy('test code'));

    await act(async () => {
      await result.current.copyToClipboard();
    });

    expect(result.current.copied).toBe(true);

    // Fast-forward 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.copied).toBe(false);
  });

  it('should handle copy errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('Clipboard error');
    mockClipboard.writeText.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useCodeBlockCopy('test code'));

    await act(async () => {
      await result.current.copyToClipboard();
    });

    expect(result.current.copied).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to copy:', error);

    consoleErrorSpy.mockRestore();
  });

  it('should update when node content changes', async () => {
    const { result, rerender } = renderHook(
      ({ content }) => useCodeBlockCopy(content),
      { initialProps: { content: 'initial content' } }
    );

    await act(async () => {
      await result.current.copyToClipboard();
    });
    expect(mockClipboard.writeText).toHaveBeenCalledWith('initial content');

    // Update content
    rerender({ content: 'updated content' });

    mockClipboard.writeText.mockClear();
    await act(async () => {
      await result.current.copyToClipboard();
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith('updated content');
  });

  it('should handle unicode and special characters', async () => {
    const unicodeContent = '你好世界 🌍 const x = "test";';
    const { result } = renderHook(() => useCodeBlockCopy(unicodeContent));

    await act(async () => {
      await result.current.copyToClipboard();
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith(unicodeContent);
  });

  it('should handle empty string', async () => {
    const { result } = renderHook(() => useCodeBlockCopy(''));

    await act(async () => {
      await result.current.copyToClipboard();
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith('');
    expect(result.current.copied).toBe(true);
  });

  it('should handle multiline code', async () => {
    const multilineCode = `function test() {
  console.log("line 1");
  console.log("line 2");
  return true;
}`;

    const { result } = renderHook(() => useCodeBlockCopy(multilineCode));

    await act(async () => {
      await result.current.copyToClipboard();
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith(multilineCode);
  });
});
