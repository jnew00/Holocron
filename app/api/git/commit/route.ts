import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";

const execAsync = promisify(exec);

// Encrypt a file using AES-256-GCM
async function encryptFile(filePath: string, passphrase: string): Promise<void> {
  const plaintext = await fs.readFile(filePath, "utf-8");

  // Generate salt and IV
  const salt = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  // Derive key from passphrase
  const key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, "sha256");

  // Encrypt
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf-8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Format: salt(32) + iv(16) + authTag(16) + encrypted
  const result = Buffer.concat([salt, iv, authTag, encrypted]);

  // Write encrypted file
  await fs.writeFile(filePath + ".enc", result);
}

export async function POST(request: NextRequest) {
  try {
    const { repoPath, message, author, passphrase } = await request.json();

    if (!repoPath || !message) {
      return NextResponse.json(
        { error: "Repository path and commit message are required" },
        { status: 400 }
      );
    }

    // If passphrase provided, encrypt all .md files before committing
    if (passphrase) {
      const notesPath = path.join(repoPath, "notes");

      // Recursively find all .md files
      async function encryptMarkdownFiles(dir: string): Promise<void> {
        try {
          const entries = await fs.readdir(dir, { withFileTypes: true });

          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
              await encryptMarkdownFiles(fullPath);
            } else if (entry.isFile() && entry.name.endsWith(".md")) {
              await encryptFile(fullPath, passphrase);
            }
          }
        } catch (error) {
          // Directory might not exist yet
        }
      }

      await encryptMarkdownFiles(notesPath);

      // Add encrypted files to git
      await execAsync("git add **/*.md.enc", { cwd: repoPath });
    }

    // Stage all changes
    await execAsync("git add -A", { cwd: repoPath });

    // Create commit with author info if provided
    let commitCmd = `git commit -m "${message.replace(/"/g, '\\"')}"`;
    if (author?.name && author?.email) {
      commitCmd = `git -c user.name="${author.name}" -c user.email="${author.email}" commit -m "${message.replace(/"/g, '\\"')}"`;
    }

    const { stdout } = await execAsync(commitCmd, { cwd: repoPath });

    return NextResponse.json({
      success: true,
      output: stdout,
    });
  } catch (error: any) {
    // Check if it's a "nothing to commit" error
    if (error.message.includes("nothing to commit")) {
      return NextResponse.json({
        success: false,
        error: "No changes to commit",
      });
    }

    return NextResponse.json(
      { error: error.message || "Failed to commit" },
      { status: 500 }
    );
  }
}
