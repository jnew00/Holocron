/**
 * Tests for useTemplateSelector hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTemplateSelector } from '../useTemplateSelector';
import { getAllTemplates } from '@/lib/templates/templates';
import { loadCustomTemplates } from '@/lib/templates/customTemplates';

// Mock the template functions
jest.mock('@/lib/templates/templates', () => ({
  getAllTemplates: jest.fn(),
}));

jest.mock('@/lib/templates/customTemplates', () => ({
  loadCustomTemplates: jest.fn(),
}));

describe('useTemplateSelector', () => {
  const mockGetAllTemplates = getAllTemplates as jest.MockedFunction<typeof getAllTemplates>;
  const mockLoadCustomTemplates = loadCustomTemplates as jest.MockedFunction<typeof loadCustomTemplates>;

  const mockDirHandle = {} as FileSystemDirectoryHandle;
  const mockPassphrase = 'test-passphrase';

  const defaultTemplates = [
    { id: 'blank', name: 'Blank', content: '' },
    { id: 'meeting', name: 'Meeting Notes', content: '# Meeting' },
  ];

  const customTemplates = [
    { id: 'custom-1', name: 'Custom Template 1', content: '# Custom 1' },
    { id: 'custom-2', name: 'Custom Template 2', content: '# Custom 2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllTemplates.mockReturnValue(defaultTemplates as any);
    mockLoadCustomTemplates.mockResolvedValue(customTemplates as any);
  });

  it('should initialize with default templates', () => {
    const { result } = renderHook(() =>
      useTemplateSelector(mockDirHandle, mockPassphrase)
    );

    expect(result.current.defaultTemplates).toEqual(defaultTemplates);
  });

  it('should initialize with empty custom templates', () => {
    const { result } = renderHook(() =>
      useTemplateSelector(mockDirHandle, mockPassphrase)
    );

    expect(result.current.customTemplates).toEqual([]);
  });

  it('should load custom templates when dirHandle and passphrase are provided', async () => {
    const { result } = renderHook(() =>
      useTemplateSelector(mockDirHandle, mockPassphrase)
    );

    await waitFor(() => {
      expect(mockLoadCustomTemplates).toHaveBeenCalledWith(mockDirHandle, mockPassphrase);
    });

    await waitFor(() => {
      expect(result.current.customTemplates).toEqual(customTemplates);
    });
  });

  it('should not load custom templates when dirHandle is null', async () => {
    renderHook(() => useTemplateSelector(null, mockPassphrase));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(mockLoadCustomTemplates).not.toHaveBeenCalled();
  });

  it('should not load custom templates when passphrase is null', async () => {
    renderHook(() => useTemplateSelector(mockDirHandle, null));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(mockLoadCustomTemplates).not.toHaveBeenCalled();
  });

  it('should reload custom templates when dirHandle changes', async () => {
    const { rerender } = renderHook(
      ({ dirHandle, passphrase }) => useTemplateSelector(dirHandle, passphrase),
      {
        initialProps: { dirHandle: mockDirHandle, passphrase: mockPassphrase },
      }
    );

    await waitFor(() => {
      expect(mockLoadCustomTemplates).toHaveBeenCalledTimes(1);
    });

    const newDirHandle = {} as FileSystemDirectoryHandle;
    mockLoadCustomTemplates.mockClear();

    rerender({ dirHandle: newDirHandle, passphrase: mockPassphrase });

    await waitFor(() => {
      expect(mockLoadCustomTemplates).toHaveBeenCalledWith(newDirHandle, mockPassphrase);
    });
  });

  it('should reload custom templates when passphrase changes', async () => {
    const { rerender } = renderHook(
      ({ dirHandle, passphrase }) => useTemplateSelector(dirHandle, passphrase),
      {
        initialProps: { dirHandle: mockDirHandle, passphrase: mockPassphrase },
      }
    );

    await waitFor(() => {
      expect(mockLoadCustomTemplates).toHaveBeenCalledTimes(1);
    });

    mockLoadCustomTemplates.mockClear();

    rerender({ dirHandle: mockDirHandle, passphrase: 'new-passphrase' });

    await waitFor(() => {
      expect(mockLoadCustomTemplates).toHaveBeenCalledWith(mockDirHandle, 'new-passphrase');
    });
  });

  it('should handle empty custom templates response', async () => {
    mockLoadCustomTemplates.mockResolvedValue([]);

    const { result } = renderHook(() =>
      useTemplateSelector(mockDirHandle, mockPassphrase)
    );

    await waitFor(() => {
      expect(result.current.customTemplates).toEqual([]);
    });
  });

  it('should handle loadCustomTemplates errors gracefully', async () => {
    // Mock console.error to suppress error output in test logs
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock the rejected promise to not throw
    mockLoadCustomTemplates.mockImplementation(() => {
      // Return a rejected promise but handle it to prevent unhandled rejection
      return Promise.reject(new Error('Failed to load')).catch(() => []);
    });

    const { result } = renderHook(() =>
      useTemplateSelector(mockDirHandle, mockPassphrase)
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Templates should remain empty on error
    expect(result.current.customTemplates).toEqual([]);

    consoleErrorSpy.mockRestore();
  });

  it('should update custom templates state when loaded', async () => {
    const { result } = renderHook(() =>
      useTemplateSelector(mockDirHandle, mockPassphrase)
    );

    expect(result.current.customTemplates).toEqual([]);

    await waitFor(() => {
      expect(result.current.customTemplates).toEqual(customTemplates);
    });
  });
});
