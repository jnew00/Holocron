import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";

/**
 * Encrypt config using passphrase-based encryption (AES-256-GCM)
 * This allows the same config to be decrypted on any machine with the passphrase
 */
function encryptConfig(plaintext: string, passphrase: string): string {
  // Derive a 32-byte key from the passphrase
  const salt = Buffer.from("localnote-config-salt-v1", "utf-8");
  const key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, "sha256");

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf-8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Format: iv(16) + authTag(16) + encrypted
  const result = Buffer.concat([iv, authTag, encrypted]);

  return result.toString("base64");
}

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

    // Encrypt config using passphrase
    const configJson = JSON.stringify(config, null, 2);
    const encryptedData = encryptConfig(configJson, passphrase);

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
