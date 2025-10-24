/**
 * Note templates for LocalNote
 * Provides pre-defined structures for common note types
 */

export interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  content: string;
}

/**
 * Get today's date in a readable format
 */
function getTodayFormatted(): string {
  const today = new Date();
  return today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Get current time in HH:MM format
 */
function getCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Default note templates
 */
export const templates: NoteTemplate[] = [
  {
    id: "blank",
    name: "Blank Note",
    description: "Start from scratch",
    icon: "FileText",
    content: "# Untitled Note\n\n",
  },
  {
    id: "daily-todo",
    name: "Daily TODO",
    description: "Plan your day with tasks",
    icon: "Calendar",
    content: `# Daily TODO - ${getTodayFormatted()}

## Top Priorities
- [ ]
- [ ]
- [ ]

## Today's Tasks
- [ ]
- [ ]
- [ ]

## Notes


## Tomorrow's Prep
- [ ]

`,
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    description: "Capture meeting discussions",
    icon: "Users",
    content: `# Meeting Notes - ${getTodayFormatted()}

**Time:** ${getCurrentTime()}
**Attendees:**
**Location/Link:**

## Agenda
1.
2.
3.

## Discussion Notes


## Action Items
- [ ]
- [ ]

## Next Steps


`,
  },
  {
    id: "scratchpad",
    name: "Scratchpad",
    description: "Quick notes and ideas",
    icon: "Edit",
    content: `# Scratchpad - ${getTodayFormatted()}

Quick thoughts, ideas, and temporary notes...

---

`,
  },
  {
    id: "til",
    name: "Today I Learned",
    description: "Document what you learned",
    icon: "Lightbulb",
    content: `# TIL - ${getTodayFormatted()}

## What I Learned


## Context


## Resources
-

## Follow-up Questions
-

`,
  },
  {
    id: "project-plan",
    name: "Project Plan",
    description: "Plan and track a project",
    icon: "FolderOpen",
    content: `# Project: [Project Name]

**Status:** Planning
**Start Date:**
**Target Completion:**

## Overview


## Goals
- [ ]
- [ ]
- [ ]

## Phases

### Phase 1:
- [ ]
- [ ]

### Phase 2:
- [ ]
- [ ]

## Resources Needed


## Risks & Blockers


## Notes


`,
  },
  {
    id: "weekly-review",
    name: "Weekly Review",
    description: "Reflect on your week",
    icon: "CheckSquare",
    content: `# Weekly Review - Week of ${getTodayFormatted()}

## Wins This Week
-
-
-

## Challenges
-
-

## What I Learned
-
-

## Next Week's Focus
- [ ]
- [ ]
- [ ]

## Personal Notes


`,
  },
  {
    id: "book-notes",
    name: "Book Notes",
    description: "Take notes while reading",
    icon: "BookOpen",
    content: `# Book Notes: [Book Title]

**Author:**
**Started:**
**Completed:**
**Rating:** ⭐⭐⭐⭐⭐

## Summary


## Key Takeaways
-
-
-

## Favorite Quotes
>

## My Thoughts


## Action Items
- [ ]

`,
  },
];

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): NoteTemplate | undefined {
  return templates.find((t) => t.id === id);
}

/**
 * Get all templates
 */
export function getAllTemplates(): NoteTemplate[] {
  return templates;
}
