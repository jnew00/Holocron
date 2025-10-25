import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";

/**
 * Decrypt config using passphrase-based encryption (AES-256-GCM)
 * This allows the same config to be decrypted on any machine with the passphrase
 */
function decryptConfig(ciphertext: string, passphrase: string): string {
  // Derive a 32-byte key from the passphrase
  const salt = Buffer.from("localnote-config-salt-v1", "utf-8");
  const key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, "sha256");

  const data = Buffer.from(ciphertext, "base64");

  // Extract components
  const iv = data.subarray(0, 16);
  const authTag = data.subarray(16, 32);
  const encrypted = data.subarray(32);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf-8");
}

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
          const decryptedJson = decryptConfig(encryptedData, passphrase);
          const config = JSON.parse(decryptedJson);

          return NextResponse.json({
            success: true,
            config,
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
