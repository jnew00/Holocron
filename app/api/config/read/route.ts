import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";
import { safeParseConfig } from "@/lib/schema/config";

/**
 * Read config from .holocron/config.json
 *
 * NEW: Config is now stored in PLAINTEXT (not encrypted)
 * The encryption metadata (salt, wrappedDEK) is public information
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoPath } = body;

    if (!repoPath) {
      return NextResponse.json(
        { error: "Repository path is required" },
        { status: 400 }
      );
    }

    // Try new plaintext config first
    const configPath = path.join(repoPath, ".holocron", "config.json");

    try {
      // Read plaintext config
      const configData = await fs.readFile(configPath, "utf-8");
      const rawConfig = JSON.parse(configData);

      // Validate config structure
      const validationResult = safeParseConfig(rawConfig);
      if (!validationResult.success) {
        console.error("Config validation failed:", validationResult.error);
        return NextResponse.json({
          error: "Invalid config structure",
          validationErrors: validationResult.error?.issues || [],
        }, { status: 422 });
      }

      return NextResponse.json({
        success: true,
        config: validationResult.data,
      });
    } catch (error: any) {
      if (error.code === "ENOENT") {
        // Try old encrypted config for backward compatibility
        const legacyConfigPath = path.join(repoPath, ".holocron", "config.json.enc");
        try {
          await fs.access(legacyConfigPath);
          return NextResponse.json({
            success: true,
            legacy: true,
            message: "Legacy encrypted config detected - migration required",
          });
        } catch {
          return NextResponse.json(
            { error: "Config not found", notFound: true },
            { status: 404 }
          );
        }
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Failed to read config:", error);
    return NextResponse.json(
      { error: error.message || "Failed to read config" },
      { status: 500 }
    );
  }
}
