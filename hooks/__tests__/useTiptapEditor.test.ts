/**
 * Tests for useTiptapEditor hook
 */

import { renderHook } from '@testing-library/react';
import { useTiptapEditor } from '../useTiptapEditor';

// Mock all Tiptap dependencies
jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn((config) => ({
    commands: {
      setContent: jest.fn(),
    },
    storage: {
      markdown: {
        getMarkdown: jest.fn(() => ''),
      },
    },
    isFocused: false,
  })),
  ReactNodeViewRenderer: jest.fn(() => ({})),
}));

jest.mock('@tiptap/starter-kit', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(() => ({})),
  },
}));

jest.mock('@tiptap/extension-placeholder', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(() => ({})),
  },
}));

jest.mock('@tiptap/extension-typography', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('@tiptap/extension-task-list', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(() => ({})),
  },
}));

jest.mock('@tiptap/extension-task-item', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(() => ({})),
  },
}));

jest.mock('@tiptap/extension-code-block-lowlight', () => ({
  CodeBlockLowlight: {
    extend: jest.fn(() => ({
      configure: jest.fn(() => ({})),
    })),
  },
}));

jest.mock('@tiptap/extension-table', () => ({
  Table: {
    configure: jest.fn(() => ({})),
  },
}));

jest.mock('@tiptap/extension-table-row', () => ({
  TableRow: {},
}));

jest.mock('@tiptap/extension-table-header', () => ({
  TableHeader: {
    configure: jest.fn(() => ({})),
  },
}));

jest.mock('@tiptap/extension-table-cell', () => ({
  TableCell: {
    configure: jest.fn(() => ({})),
  },
}));

jest.mock('@tiptap/extension-highlight', () => ({
  Highlight: {
    configure: jest.fn(() => ({})),
  },
}));

jest.mock('@tiptap/extension-underline', () => ({
  Underline: {},
}));

jest.mock('@tiptap/extension-text-align', () => ({
  TextAlign: {
    configure: jest.fn(() => ({})),
  },
}));

jest.mock('@tiptap/extension-link', () => ({
  Link: {
    configure: jest.fn(() => ({})),
  },
}));

jest.mock('@tiptap/extension-mention', () => ({
  Mention: {
    configure: jest.fn(() => ({})),
  },
}));

jest.mock('tiptap-markdown', () => ({
  Markdown: {
    configure: jest.fn(() => ({})),
  },
}));

jest.mock('lowlight', () => ({
  all: {},
  createLowlight: jest.fn(() => ({})),
}));

jest.mock('@/lib/editor/kanbanMentionSuggestion', () => ({
  createKanbanMentionSuggestion: jest.fn(() => ({})),
}));

jest.mock('@/components/editor/CodeBlockComponent', () => ({
  CodeBlockComponent: () => null,
}));

describe('useTiptapEditor', () => {
  it('should initialize editor', () => {
    const { result } = renderHook(() =>
      useTiptapEditor({
        content: 'test content',
        onChange: jest.fn(),
        placeholder: 'Enter text...',
        editable: true,
        kanbanBoards: [],
      })
    );

    expect(result.current).toBeDefined();
  });
});
