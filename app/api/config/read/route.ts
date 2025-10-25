import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";
import { decryptConfig } from "@/lib/crypto/unified";
import { validateConfig, safeParseConfig } from "@/lib/schema/config";

export async function GET(request: NextRequest) {
  try {
    const repoPath = request.nextUrl.searchParams.get("repoPath");
    const passphrase = request.nextUrl.searchParams.get("passphrase");

    if (!repoPath) {
      return NextResponse.json(
        { error: "Repository path is required" },
        { status: 400 }
      );
    }

    const configPath = path.join(repoPath, ".localnote", "config.json.enc");

    try {
      // Read encrypted config
      const encryptedData = await fs.readFile(configPath, "utf-8");

      // If passphrase is provided, try to decrypt
      if (passphrase) {
        try {
          const decryptedJson = await decryptConfig(encryptedData, passphrase);
          const rawConfig = JSON.parse(decryptedJson);

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
        } catch (decryptError) {
          // Decryption failed - wrong passphrase
          return NextResponse.json(
            { error: "Invalid passphrase", invalidPassphrase: true },
            { status: 401 }
          );
        }
      } else {
        // No passphrase provided - just check if config exists
        return NextResponse.json({
          success: true,
          exists: true,
        });
      }
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return NextResponse.json(
          { error: "Config not found", notFound: true },
          { status: 404 }
        );
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
