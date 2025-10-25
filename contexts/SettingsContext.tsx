"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRepo } from "./RepoContext";

interface Settings {
  showCodeBlockLanguageSelector: boolean;
  // Theme settings
  theme: "light" | "dark" | "system";
  accentColor: string;
  uiFont: string;
  editorFont: string;
  editorTheme: "github-light" | "github-dark" | "monokai" | "dracula" | "nord";
  density: "compact" | "comfortable" | "spacious";
  // Font size settings (percentage: 50-200)
  fontSizeGlobal: number;
  fontSizeEditor: number;
  // Auto-sync settings
  autoSyncEnabled: boolean;
  autoSyncInterval: number; // in minutes
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  showCodeBlockLanguageSelector: false,
  theme: "system",
  accentColor: "blue", // Tailwind color names
  uiFont: "system-ui",
  editorFont: "mono",
  editorTheme: "github-light",
  density: "comfortable",
  fontSizeGlobal: 100, // 100% = default size
  fontSizeEditor: 100, // 100% = default size
  autoSyncEnabled: false,
  autoSyncInterval: 30, // 30 minutes default
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from filesystem config on mount
  useEffect(() => {
    const loadSettings = async () => {
      // Try localStorage first for backwards compatibility
      const saved = localStorage.getItem("localnote-settings");
      if (saved) {
        try {
          setSettings({ ...defaultSettings, ...JSON.parse(saved) });
          setIsLoaded(true);
        } catch (e) {
          console.error("Failed to load settings from localStorage:", e);
        }
      }

      // Try to load from filesystem config
      const repoPath = localStorage.getItem("localnote-repo-path");
      if (repoPath) {
        try {
          const response = await fetch(`/api/config/read?repoPath=${encodeURIComponent(repoPath)}`);
          if (response.ok) {
            const data = await response.json();
            if (data.config?.settings) {
              setSettings({ ...defaultSettings, ...data.config.settings });
              setIsLoaded(true);
            }
          }
        } catch (e) {
          console.error("Failed to load settings from config:", e);
        }
      }

      setIsLoaded(true);
    };

    loadSettings();
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    const root = document.documentElement;

    // Handle dark/light mode
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else if (settings.theme === "light") {
      root.classList.remove("dark");
    } else {
      // System preference
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }

    // Apply density class
    root.classList.remove("density-compact", "density-comfortable", "density-spacious");
    root.classList.add(`density-${settings.density}`);

    // Apply accent color to CSS variables
    const accentColors: Record<string, { light: string; dark: string }> = {
      blue: { light: "221.2 83.2% 53.3%", dark: "217.2 91.2% 59.8%" },
      purple: { light: "262.1 83.3% 57.8%", dark: "263.4 70% 50.4%" },
      green: { light: "142.1 76.2% 36.3%", dark: "142.1 70.6% 45.3%" },
      orange: { light: "24.6 95% 53.1%", dark: "20.5 90.2% 48.2%" },
      red: { light: "0 84.2% 60.2%", dark: "0 72.2% 50.6%" },
      pink: { light: "330 81% 60%", dark: "330 81% 60%" },
    };

    const accentColor = accentColors[settings.accentColor] || accentColors.blue;
    root.style.setProperty("--primary", root.classList.contains("dark") ? accentColor.dark : accentColor.light);
    root.style.setProperty("--primary-foreground", "0 0% 98%");

    // Apply UI font
    const uiFonts: Record<string, string> = {
      "system-ui": "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
      "inter": "'Inter', sans-serif",
      "roboto": "'Roboto', sans-serif",
      "open-sans": "'Open Sans', sans-serif",
    };
    root.style.setProperty("--font-ui", uiFonts[settings.uiFont] || uiFonts["system-ui"]);

    // Apply editor font
    const editorFonts: Record<string, string> = {
      "mono": "ui-monospace, SFMono-Regular, 'SF Mono', Monaco, 'Cascadia Mono', 'Segoe UI Mono', 'Roboto Mono', 'Oxygen Mono', 'Ubuntu Monospace', 'Source Code Pro', 'Fira Mono', 'Droid Sans Mono', 'Courier New', monospace",
      "fira-code": "'Fira Code', monospace",
      "jetbrains-mono": "'JetBrains Mono', monospace",
      "source-code-pro": "'Source Code Pro', monospace",
      "cascadia-code": "'Cascadia Code', monospace",
    };
    root.style.setProperty("--font-editor", editorFonts[settings.editorFont] || editorFonts["mono"]);

    // Apply font size settings to html element (affects all rem-based sizing)
    document.documentElement.style.fontSize = `${settings.fontSizeGlobal}%`;

    // Set editor-specific font size as CSS variable
    root.style.setProperty("--font-size-editor-scale", `${settings.fontSizeEditor / 100}`);
  }, [settings.theme, settings.density, settings.accentColor, settings.uiFont, settings.editorFont, settings.fontSizeGlobal, settings.fontSizeEditor]);

  // Save settings to filesystem config whenever they change
  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    // Save to localStorage for backwards compatibility
    localStorage.setItem("localnote-settings", JSON.stringify(updated));

    // Save to filesystem config
    const repoPath = localStorage.getItem("localnote-repo-path");
    if (repoPath) {
      try {
        // First, read existing config
        const readResponse = await fetch(`/api/config/read?repoPath=${encodeURIComponent(repoPath)}`);
        let existingConfig: any = { version: "1.0" };

        if (readResponse.ok) {
          const data = await readResponse.json();
          existingConfig = data.config || existingConfig;
          console.log("[SettingsContext] Existing config has passphrase:", !!existingConfig.passphrase);
        }

        // CRITICAL: Don't save settings if we might lose the passphrase
        if (existingConfig.passphrase) {
          // Merge settings into config, ALWAYS preserving passphrase
          const newConfig = {
            ...existingConfig,
            settings: updated,
            updatedAt: new Date().toISOString(),
            // Explicitly preserve passphrase (critical!)
            passphrase: existingConfig.passphrase,
          };

          console.log("[SettingsContext] Saving config WITH passphrase preserved");

          // Write updated config
          await fetch("/api/config/write", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              repoPath,
              config: newConfig,
            }),
          });
        } else {
          console.warn("[SettingsContext] Skipping config save - no passphrase in existing config, would lose it!");
        }
      } catch (e) {
        console.error("Failed to save settings to config:", e);
      }
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
