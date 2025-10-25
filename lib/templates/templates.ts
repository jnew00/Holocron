/**
 * Note templates for LocalNote
 * Provides pre-defined structures for common note types
 */

import { NoteType } from "@/lib/notes/types";

export interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  content: string;
  type: NoteType;
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
    type: "note",
  },
  {
    id: "daily-todo",
    name: "Daily TODO",
    description: "Plan your day with tasks",
    icon: "Calendar",
    type: "todo",
    content: `# Daily TODO - ${getTodayFormatted()}

## Top Priorities
- [ ] Priority task 1
- [ ] Priority task 2
- [ ] Priority task 3

## Today's Tasks
- [ ] Task item 1
- [ ] Task item 2
- [ ] Task item 3
- [ ] Task item 4
- [ ] Task item 5

## Notes
Add any notes or context here...

## Tomorrow's Prep
- [ ] Prepare for tomorrow

---
*Created: ${getCurrentTime()}*
`,
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    description: "Capture meeting discussions",
    icon: "Users",
    type: "meeting",
    content: `# Meeting Notes - ${getTodayFormatted()}

**Time:** ${getCurrentTime()}
**Attendees:** @name1, @name2
**Location/Link:** Office / Zoom

---

## Agenda
1. Topic 1
2. Topic 2
3. Topic 3

## Discussion Notes
- Key point discussed
- Decision made
- Important feedback

## Action Items
- [ ] @person - Action item 1
- [ ] @person - Action item 2
- [ ] @person - Action item 3

## Next Steps
- [ ] Schedule follow-up meeting
- [ ] Share meeting notes with team

---
*Meeting Date: ${getTodayFormatted()}*
`,
  },
  {
    id: "scratchpad",
    name: "Scratchpad",
    description: "Quick notes and ideas",
    icon: "Edit",
    type: "scratchpad",
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
    type: "til",
    content: `# TIL - ${getTodayFormatted()}

## What I Learned
Brief summary of what you learned today...

## Context
Why is this important? How does it relate to your work or projects?

## Key Takeaways
- Main point 1
- Main point 2
- Main point 3

## Resources
- [Resource 1](url)
- [Resource 2](url)

## Follow-up Questions
- [ ] Question to explore later
- [ ] Another topic to research

---
*Learned: ${getTodayFormatted()}*
`,
  },
  {
    id: "project-plan",
    name: "Project Plan",
    description: "Plan and track a project",
    icon: "FolderOpen",
    type: "project",
    content: `# Project: [Project Name]

**Status:** 🟡 Planning
**Start Date:** ${getTodayFormatted()}
**Target Completion:** TBD
**Owner:** Your Name

---

## Overview
Brief description of the project, its purpose, and expected outcomes.

## Goals & Success Criteria
- [ ] Goal 1: Specific measurable outcome
- [ ] Goal 2: Another key deliverable
- [ ] Goal 3: Success metric

## Phases & Milestones

### Phase 1: Planning & Research
- [ ] Define requirements
- [ ] Research solutions
- [ ] Create technical design

### Phase 2: Development
- [ ] Build core features
- [ ] Write tests
- [ ] Code review

### Phase 3: Testing & Launch
- [ ] QA testing
- [ ] Fix bugs
- [ ] Deploy to production

## Resources Needed
| Resource | Status | Notes |
|----------|--------|-------|
| Team member 1 | ✅ Assigned | Role description |
| Budget | ⏳ Pending | Amount needed |
| Tools/Software | ❌ Missing | What's needed |

## Risks & Blockers
- ⚠️ Risk 1: Description and mitigation plan
- ⚠️ Risk 2: Description and mitigation plan

## Notes & Updates
*Latest update: ${getTodayFormatted()}*

Add project notes, decisions, and updates here...

`,
  },
  {
    id: "weekly-review",
    name: "Weekly Review",
    description: "Reflect on your week",
    icon: "CheckSquare",
    type: "weekly",
    content: `# Weekly Review - Week of ${getTodayFormatted()}

## 🎉 Wins This Week
- ✅ Major accomplishment 1
- ✅ Achievement 2
- ✅ Success 3

## 💪 Challenges Faced
- Challenge 1 and how I addressed it
- Challenge 2 and lessons learned

## 📚 What I Learned
- Learning 1
- Learning 2
- New skill or insight

## 📊 Progress on Goals
- [ ] Goal 1 - Status update
- [ ] Goal 2 - Status update
- [ ] Goal 3 - Status update

## 🎯 Next Week's Focus
- [ ] Priority 1
- [ ] Priority 2
- [ ] Priority 3

## 💭 Personal Notes & Reflections
Add any additional thoughts, ideas, or reflections here...

---
*Week ending: ${getTodayFormatted()}*
`,
  },
  {
    id: "book-notes",
    name: "Book Notes",
    description: "Take notes while reading",
    icon: "BookOpen",
    type: "book",
    content: `# 📖 Book Notes: [Book Title]

**Author:** Author Name
**Started:** ${getTodayFormatted()}
**Completed:** TBD
**Rating:** ⭐⭐⭐⭐⭐

---

## 📝 Summary
Brief overview of the book's main themes and content...

## 💡 Key Takeaways
1. First major insight or lesson
2. Second important concept
3. Third key takeaway

## ❤️ Favorite Quotes
> "Quote 1 that resonated with you"
> — Page X

> "Another meaningful quote"
> — Page Y

## 🤔 My Thoughts & Reflections
- How does this apply to my life/work?
- What challenged my thinking?
- Connections to other books or ideas

## 📊 Chapter Notes
| Chapter | Key Points | Page |
|---------|-----------|------|
| 1 | Main idea | 12 |
| 2 | Important concept | 34 |
| 3 | Key insight | 56 |

## ✅ Action Items
- [ ] Apply lesson 1 to project/situation
- [ ] Research topic mentioned in chapter X
- [ ] Share this book with [person]

---
*Last updated: ${getTodayFormatted()}*
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
