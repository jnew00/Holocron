import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";
import { encryptConfig } from "@/lib/crypto/unified";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoPath, config, passphrase } = body;

    if (!repoPath || !config || !passphrase) {
      return NextResponse.json(
        { error: "Repository path, config, and passphrase are required" },
        { status: 400 }
      );
    }

    const configDir = path.join(repoPath, ".localnote");
    const configPath = path.join(configDir, "config.json.enc");

    // Ensure directory exists
    await fs.mkdir(configDir, { recursive: true });

    // Encrypt config using unified crypto (fixed salt for cross-device compatibility)
    const configJson = JSON.stringify(config, null, 2);
    const encryptedData = await encryptConfig(configJson, passphrase);

    // Write encrypted config
    await fs.writeFile(configPath, encryptedData, "utf-8");

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
