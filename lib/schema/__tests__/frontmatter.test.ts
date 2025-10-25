/**
 * Tests for frontmatter schema validation
 */

import {
  validateFrontmatter,
  safeParseFrontmatter,
  validateTypedFrontmatter,
  NoteTypeSchema,
  FrontmatterSchema,
  MeetingFrontmatterSchema,
  TodoFrontmatterSchema,
} from "../frontmatter";

describe("Frontmatter Schema Validation", () => {
  describe("NoteTypeSchema", () => {
    it("should accept valid note types", () => {
      const validTypes = ["note", "todo", "meeting", "scratchpad", "til", "project", "weekly", "book"];
      validTypes.forEach(type => {
        expect(() => NoteTypeSchema.parse(type)).not.toThrow();
      });
    });

    it("should reject invalid note types", () => {
      expect(() => NoteTypeSchema.parse("invalid-type")).toThrow();
      expect(() => NoteTypeSchema.parse("")).toThrow();
      expect(() => NoteTypeSchema.parse(123)).toThrow();
    });
  });

  describe("FrontmatterSchema", () => {
    it("should validate basic frontmatter", () => {
      const data = {
        type: "note",
        tags: ["test", "example"],
      };
      const result = validateFrontmatter(data);
      expect(result.type).toBe("note");
      expect(result.tags).toEqual(["test", "example"]);
    });

    it("should allow empty frontmatter", () => {
      const result = validateFrontmatter({});
      expect(result).toEqual({});
    });

    it("should validate timestamps", () => {
      const data = {
        createdAt: "2025-10-25T12:00:00.000Z",
        updatedAt: "2025-10-25T13:00:00.000Z",
      };
      const result = validateFrontmatter(data);
      expect(result.createdAt).toBe(data.createdAt);
    });

    it("should reject invalid timestamps", () => {
      const data = {
        createdAt: "not-a-date",
      };
      expect(() => validateFrontmatter(data)).toThrow();
    });

    it("should allow additional fields (passthrough)", () => {
      const data = {
        type: "note",
        customField: "custom value",
        anotherField: 123,
      };
      const result = validateFrontmatter(data);
      expect(result.customField).toBe("custom value");
      expect(result.anotherField).toBe(123);
    });

    it("should reject invalid tag format", () => {
      const data = {
        tags: "not-an-array",
      };
      expect(() => validateFrontmatter(data)).toThrow();
    });
  });

  describe("safeParseFrontmatter", () => {
    it("should return success for valid data", () => {
      const data = {
        type: "note",
        tags: ["test"],
      };
      const result = safeParseFrontmatter(data);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it("should return error for invalid data", () => {
      const data = {
        type: "invalid-type",
      };
      const result = safeParseFrontmatter(data);
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });

  describe("MeetingFrontmatterSchema", () => {
    it("should validate meeting-specific fields", () => {
      const data = {
        type: "meeting" as const,
        attendees: ["Alice", "Bob"],
        location: "Conference Room A",
        date: "2025-10-25T14:00:00.000Z",
      };
      const result = MeetingFrontmatterSchema.parse(data);
      expect(result.type).toBe("meeting");
      expect(result.attendees).toEqual(["Alice", "Bob"]);
      expect(result.location).toBe("Conference Room A");
    });

    it("should require type to be 'meeting'", () => {
      const data = {
        type: "note" as any,
        attendees: ["Alice"],
      };
      expect(() => MeetingFrontmatterSchema.parse(data)).toThrow();
    });
  });

  describe("TodoFrontmatterSchema", () => {
    it("should validate todo-specific fields", () => {
      const data = {
        type: "todo" as const,
        status: "in-progress" as const,
        priority: "high" as const,
        dueDate: "2025-10-26T00:00:00.000Z",
      };
      const result = TodoFrontmatterSchema.parse(data);
      expect(result.type).toBe("todo");
      expect(result.status).toBe("in-progress");
      expect(result.priority).toBe("high");
    });

    it("should reject invalid status values", () => {
      const data = {
        type: "todo" as const,
        status: "invalid-status",
      };
      expect(() => TodoFrontmatterSchema.parse(data)).toThrow();
    });

    it("should reject invalid priority values", () => {
      const data = {
        type: "todo" as const,
        priority: "super-urgent",
      };
      expect(() => TodoFrontmatterSchema.parse(data)).toThrow();
    });
  });

  describe("validateTypedFrontmatter", () => {
    it("should validate meeting frontmatter", () => {
      const data = {
        type: "meeting",
        attendees: ["Alice"],
      };
      const result = validateTypedFrontmatter(data);
      expect(result.type).toBe("meeting");
    });

    it("should validate todo frontmatter", () => {
      const data = {
        type: "todo",
        status: "pending",
      };
      const result = validateTypedFrontmatter(data);
      expect(result.type).toBe("todo");
    });

    it("should fall back to basic schema for untyped frontmatter", () => {
      const data = {
        tags: ["test"],
      };
      const result = validateTypedFrontmatter(data);
      expect(result.tags).toEqual(["test"]);
      expect(result.type).toBeUndefined();
    });

    it("should fall back to basic schema for unsupported types", () => {
      const data = {
        type: "note", // note is not in discriminated union
        tags: ["test"],
      };
      const result = validateTypedFrontmatter(data);
      expect(result.type).toBe("note");
      expect(result.tags).toEqual(["test"]);
    });
  });
});
