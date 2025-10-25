/**
 * Test helper utilities for hook testing
 * Provides mock contexts and common test utilities
 */

import React from 'react';
import { ReactNode } from 'react';

/**
 * Mock RepoContext for testing
 */
export const createMockRepoContext = (overrides?: Partial<{
  repoPath: string | null;
  isUnlocked: boolean;
  passphrase: string | null;
  getPassphrase: () => string | null;
  setRepo: (path: string, passphrase: string) => void;
  setRepoPath: (path: string) => void;
  lock: () => void;
}>) => ({
  repoPath: '/test/repo',
  isUnlocked: true,
  passphrase: 'test-passphrase',
  getPassphrase: jest.fn(() => 'test-passphrase'),
  setRepo: jest.fn(),
  setRepoPath: jest.fn(),
  lock: jest.fn(),
  ...overrides,
});

/**
 * Mock SettingsContext for testing
 */
export const createMockSettingsContext = (overrides?: Partial<{
  settings: any;
  updateSettings: (settings: any) => void;
}>) => ({
  settings: {
    showCodeBlockLanguageSelector: false,
    theme: 'system' as const,
    accentColor: 'blue',
    uiFont: 'system-ui',
    editorFont: 'mono',
    editorTheme: 'github-light' as const,
    density: 'comfortable' as const,
    fontSizeGlobal: 100,
    fontSizeEditor: 100,
    autoSyncEnabled: false,
    autoSyncInterval: 30,
    autoSyncScheduleEnabled: false,
    autoSyncScheduleTime: '17:00',
    autoSyncScheduleDays: [0, 1, 2, 3, 4, 5, 6],
  },
  updateSettings: jest.fn(),
  ...overrides,
});

/**
 * Mock repository classes
 */
export class MockNoteRepository {
  repoPath: string;

  constructor(repoPath: string) {
    this.repoPath = repoPath;
  }

  list = jest.fn().mockResolvedValue([]);
  read = jest.fn().mockResolvedValue({ content: '', metadata: {} });
  save = jest.fn().mockResolvedValue(undefined);
  delete = jest.fn().mockResolvedValue(undefined);
  rename = jest.fn().mockResolvedValue(undefined);
}

export class MockKanbanRepository {
  repoPath: string;

  constructor(repoPath: string) {
    this.repoPath = repoPath;
  }

  readBoard = jest.fn().mockResolvedValue({
    id: 'test-board',
    name: 'Test Board',
    columns: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  saveBoard = jest.fn().mockResolvedValue(undefined);
  listBoards = jest.fn().mockResolvedValue([]);
  deleteBoard = jest.fn().mockResolvedValue(undefined);
}

/**
 * Mock RepositoryError
 */
export class MockRepositoryError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'RepositoryError';
  }

  is(code: string) {
    return this.code === code;
  }
}

/**
 * Wrapper component for providing contexts in tests
 */
export interface TestWrapperProps {
  children: ReactNode;
  repoContext?: ReturnType<typeof createMockRepoContext>;
  settingsContext?: ReturnType<typeof createMockSettingsContext>;
}

/**
 * Mock localStorage
 */
export const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };
})();

/**
 * Mock fetch for API calls
 */
export const createMockFetch = (responses: Record<string, any> = {}) => {
  return jest.fn((url: string, options?: RequestInit) => {
    const matchedResponse = Object.entries(responses).find(([key]) =>
      url.includes(key)
    );

    if (matchedResponse) {
      const [, response] = matchedResponse;
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(JSON.stringify(response)),
      } as Response);
    }

    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not found' }),
      text: () => Promise.resolve('Not found'),
    } as Response);
  });
};

/**
 * Wait for next tick (useful for testing async effects)
 */
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Wait for condition to be true
 */
export const waitFor = async (
  condition: () => boolean,
  timeout = 1000,
  interval = 50
): Promise<void> => {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
};

/**
 * Create a promise that can be resolved/rejected externally
 */
export interface DeferredPromise<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

export const createDeferred = <T,>(): DeferredPromise<T> => {
  let resolve!: (value: T) => void;
  let reject!: (error: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};
