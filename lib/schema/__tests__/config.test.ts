/**
 * Tests for config schema validation
 */

import {
  validateConfig,
  safeParseConfig,
  validateSettings,
  createDefaultConfig,
  SettingsSchema,
  ConfigSchema,
  ThemeSchema,
  EditorThemeSchema,
  DensitySchema,
} from "../config";

describe("Config Schema Validation", () => {
  describe("ThemeSchema", () => {
    it("should accept valid themes", () => {
      expect(() => ThemeSchema.parse("light")).not.toThrow();
      expect(() => ThemeSchema.parse("dark")).not.toThrow();
      expect(() => ThemeSchema.parse("system")).not.toThrow();
    });

    it("should reject invalid themes", () => {
      expect(() => ThemeSchema.parse("blue")).toThrow();
      expect(() => ThemeSchema.parse("")).toThrow();
    });
  });

  describe("EditorThemeSchema", () => {
    it("should accept valid editor themes", () => {
      const validThemes = ["github-light", "github-dark", "monokai", "dracula", "nord"];
      validThemes.forEach(theme => {
        expect(() => EditorThemeSchema.parse(theme)).not.toThrow();
      });
    });

    it("should reject invalid editor themes", () => {
      expect(() => EditorThemeSchema.parse("vscode")).toThrow();
    });
  });

  describe("DensitySchema", () => {
    it("should accept valid density values", () => {
      expect(() => DensitySchema.parse("compact")).not.toThrow();
      expect(() => DensitySchema.parse("comfortable")).not.toThrow();
      expect(() => DensitySchema.parse("spacious")).not.toThrow();
    });

    it("should reject invalid density values", () => {
      expect(() => DensitySchema.parse("large")).toThrow();
    });
  });

  describe("SettingsSchema", () => {
    it("should validate complete settings", () => {
      const settings = {
        showCodeBlockLanguageSelector: true,
        theme: "dark" as const,
        accentColor: "purple",
        uiFont: "inter",
        editorFont: "fira-code",
        editorTheme: "dracula" as const,
        density: "compact" as const,
        fontSizeGlobal: 110,
        fontSizeEditor: 95,
        autoSyncEnabled: true,
        autoSyncInterval: 15,
        autoSyncScheduleEnabled: true,
        autoSyncScheduleTime: "09:00",
        autoSyncScheduleDays: [1, 2, 3, 4, 5],
      };
      const result = validateSettings(settings);
      expect(result.theme).toBe("dark");
      expect(result.fontSizeGlobal).toBe(110);
    });

    it("should apply defaults for missing fields", () => {
      const result = SettingsSchema.parse({});
      expect(result.theme).toBe("system");
      expect(result.fontSizeGlobal).toBe(100);
      expect(result.autoSyncEnabled).toBe(false);
      expect(result.density).toBe("comfortable");
    });

    it("should validate font size range", () => {
      // Valid range
      expect(() => SettingsSchema.parse({ fontSizeGlobal: 50 })).not.toThrow();
      expect(() => SettingsSchema.parse({ fontSizeGlobal: 200 })).not.toThrow();

      // Out of range
      expect(() => SettingsSchema.parse({ fontSizeGlobal: 49 })).toThrow();
      expect(() => SettingsSchema.parse({ fontSizeGlobal: 201 })).toThrow();
    });

    it("should validate auto-sync interval range", () => {
      // Valid range
      expect(() => SettingsSchema.parse({ autoSyncInterval: 1 })).not.toThrow();
      expect(() => SettingsSchema.parse({ autoSyncInterval: 1440 })).not.toThrow();

      // Out of range
      expect(() => SettingsSchema.parse({ autoSyncInterval: 0 })).toThrow();
      expect(() => SettingsSchema.parse({ autoSyncInterval: 1441 })).toThrow();
    });

    it("should validate time format (HH:MM)", () => {
      // Valid formats
      expect(() => SettingsSchema.parse({ autoSyncScheduleTime: "09:30" })).not.toThrow();
      expect(() => SettingsSchema.parse({ autoSyncScheduleTime: "23:59" })).not.toThrow();
      expect(() => SettingsSchema.parse({ autoSyncScheduleTime: "00:00" })).not.toThrow();

      // Invalid formats (pattern only checks format, not valid ranges)
      expect(() => SettingsSchema.parse({ autoSyncScheduleTime: "9:30" })).toThrow(); // Missing leading zero
      expect(() => SettingsSchema.parse({ autoSyncScheduleTime: "not-time" })).toThrow();
      expect(() => SettingsSchema.parse({ autoSyncScheduleTime: "12:5" })).toThrow(); // Missing trailing zero
    });

    it("should validate day numbers (0-6)", () => {
      expect(() => SettingsSchema.parse({ autoSyncScheduleDays: [0, 1, 2] })).not.toThrow();
      expect(() => SettingsSchema.parse({ autoSyncScheduleDays: [5, 6] })).not.toThrow();

      // Out of range
      expect(() => SettingsSchema.parse({ autoSyncScheduleDays: [-1] })).toThrow();
      expect(() => SettingsSchema.parse({ autoSyncScheduleDays: [7] })).toThrow();
    });
  });

  describe("ConfigSchema", () => {
    it("should validate complete config", () => {
      const config = {
        version: "1.0",
        passphrase: "encrypted-passphrase-here",
        settings: {
          theme: "dark" as const,
          accentColor: "blue",
          uiFont: "system-ui",
          editorFont: "mono",
          editorTheme: "github-dark" as const,
          density: "comfortable" as const,
          fontSizeGlobal: 100,
          fontSizeEditor: 100,
          showCodeBlockLanguageSelector: false,
          autoSyncEnabled: false,
          autoSyncInterval: 30,
          autoSyncScheduleEnabled: false,
          autoSyncScheduleTime: "17:00",
          autoSyncScheduleDays: [0, 1, 2, 3, 4, 5, 6],
        },
        createdAt: "2025-10-25T12:00:00.000Z",
        updatedAt: "2025-10-25T13:00:00.000Z",
      };
      const result = validateConfig(config);
      expect(result.version).toBe("1.0");
      expect(result.passphrase).toBe("encrypted-passphrase-here");
    });

    it("should allow minimal config", () => {
      const config = {
        version: "1.0",
      };
      const result = validateConfig(config);
      expect(result.version).toBe("1.0");
      expect(result.passphrase).toBeUndefined();
      expect(result.settings).toBeUndefined();
    });

    it("should apply defaults", () => {
      const result = ConfigSchema.parse({});
      expect(result.version).toBe("1.0");
    });

    it("should validate timestamps", () => {
      const config = {
        createdAt: "2025-10-25T12:00:00.000Z",
        updatedAt: "not-a-date",
      };
      expect(() => validateConfig(config)).toThrow();
    });
  });

  describe("safeParseConfig", () => {
    it("should return success for valid config", () => {
      const config = {
        version: "1.0",
        passphrase: "test",
      };
      const result = safeParseConfig(config);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it("should return error for invalid config", () => {
      const config = {
        version: 123, // Wrong type
      };
      const result = safeParseConfig(config);
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });

  describe("createDefaultConfig", () => {
    it("should create config with defaults", () => {
      const config = createDefaultConfig();
      expect(config.version).toBe("1.0");
      expect(config.settings).toBeDefined();
      expect(config.settings?.theme).toBe("system");
      expect(config.createdAt).toBeDefined();
      expect(config.updatedAt).toBeDefined();
    });

    it("should include passphrase if provided", () => {
      const config = createDefaultConfig("my-passphrase");
      expect(config.passphrase).toBe("my-passphrase");
    });

    it("should have all default settings", () => {
      const config = createDefaultConfig();
      expect(config.settings?.fontSizeGlobal).toBe(100);
      expect(config.settings?.autoSyncEnabled).toBe(false);
      expect(config.settings?.density).toBe("comfortable");
    });
  });
});
