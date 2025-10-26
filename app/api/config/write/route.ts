import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";
import { safeParseConfig } from "@/lib/schema/config";

/**
 * Write config to .holocron/config.json
 *
 * NEW: Config is now stored in PLAINTEXT (not encrypted)
 * No passphrase needed - just write JSON directly!
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoPath, config } = body;

    if (!repoPath || !config) {
      return NextResponse.json(
        { error: "Repository path and config are required" },
        { status: 400 }
      );
    }

    // Validate config structure before writing
    const validationResult = safeParseConfig(config);
    if (!validationResult.success) {
      console.error("Config validation failed:", validationResult.error);
      return NextResponse.json({
        error: "Invalid config structure",
        validationErrors: validationResult.error?.issues || [],
      }, { status: 422 });
    }

    const configDir = path.join(repoPath, ".holocron");
    const configPath = path.join(configDir, "config.json");

    console.log("[CONFIG WRITE] Writing to:", configPath);
    console.log("[CONFIG WRITE] Config version:", validationResult.data.version);

    // Ensure directory exists
    await fs.mkdir(configDir, { recursive: true });

    // Write plaintext config (much simpler!)
    const configJson = JSON.stringify(validationResult.data, null, 2);
    await fs.writeFile(configPath, configJson, "utf-8");

    console.log("[CONFIG WRITE] Successfully wrote config.json");

    return NextResponse.json({
      success: true,
      message: "Config saved successfully",
    });
  } catch (error: any) {
    console.error("Failed to write config:", error);
    return NextResponse.json(
      { error: error.message || "Failed to write config" },
      { status: 500 }
    );
  }
}
