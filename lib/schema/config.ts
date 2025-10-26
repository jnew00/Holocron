/**
 * Zod schemas for application config validation
 * Validates structure of .holocron/config.json.enc
 */

import { z } from "zod";

/**
 * Theme configuration schema
 */
export const ThemeSchema = z.enum(["light", "dark", "system"]);

/**
 * Editor theme schema
 */
export const EditorThemeSchema = z.enum([
  "github-light",
  "github-dark",
  "monokai",
  "dracula",
  "nord",
]);

/**
 * Density configuration schema
 */
export const DensitySchema = z.enum(["compact", "comfortable", "spacious"]);

/**
 * Settings schema
 * Mirrors the Settings interface from SettingsContext
 */
export const SettingsSchema = z.object({
  // Code block settings
  showCodeBlockLanguageSelector: z.boolean().default(false),

  // Theme settings
  theme: ThemeSchema.default("system"),
  accentColor: z.string().default("blue"),
  uiFont: z.string().default("system-ui"),
  editorFont: z.string().default("mono"),
  editorTheme: EditorThemeSchema.default("github-light"),
  density: DensitySchema.default("comfortable"),

  // Font size settings (percentage: 50-200)
  fontSizeGlobal: z.number().min(50).max(200).default(100),
  fontSizeEditor: z.number().min(50).max(200).default(100),

  // Auto-sync settings
  autoSyncEnabled: z.boolean().default(false),
  autoSyncInterval: z.number().min(1).max(1440).default(30), // 1 min to 24 hours

  // Scheduled sync settings
  autoSyncScheduleEnabled: z.boolean().default(false),
  autoSyncScheduleTime: z.string().regex(/^\d{2}:\d{2}$/).default("17:00"), // HH:MM format
  autoSyncScheduleDays: z.array(z.number().min(0).max(6)).default([0, 1, 2, 3, 4, 5, 6]), // 0-6 (Sunday-Saturday)
});

/**
 * Main config schema
 * Structure of the encrypted config file
 */
export const ConfigSchema = z.object({
  // Config version for migrations
  version: z.string().default("1.0"),

  // Encrypted passphrase (stored in config for auto-unlock)
  passphrase: z.string().optional(),

  // User settings
  settings: SettingsSchema.optional(),

  // Timestamps
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

/**
 * Validate config data
 * Returns parsed data or throws validation error
 */
export function validateConfig(data: unknown): z.infer<typeof ConfigSchema> {
  return ConfigSchema.parse(data);
}

/**
 * Safe validation that returns error instead of throwing
 */
export function safeParseConfig(data: unknown): {
  success: boolean;
  data?: z.infer<typeof ConfigSchema>;
  error?: z.ZodError;
} {
  const result = ConfigSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Validate settings data (subset of config)
 */
export function validateSettings(data: unknown): z.infer<typeof SettingsSchema> {
  return SettingsSchema.parse(data);
}

/**
 * Create a new config with defaults
 */
export function createDefaultConfig(passphrase?: string): z.infer<typeof ConfigSchema> {
  return {
    version: "1.0",
    passphrase,
    settings: SettingsSchema.parse({}), // Apply all defaults
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Export TypeScript types inferred from schemas
export type Config = z.infer<typeof ConfigSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type EditorTheme = z.infer<typeof EditorThemeSchema>;
export type Density = z.infer<typeof DensitySchema>;
