import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";
import { encryptWithDEK, base64Decode } from "@/lib/crypto/unified";

const execAsync = promisify(exec);

// Encrypt a file using DEK (NEW - much faster than PBKDF2!)
async function encryptFile(filePath: string, dek: Uint8Array, repoPath: string): Promise<void> {
  const plaintext = await fs.readFile(filePath, "utf-8");

  // Calculate relative path for AAD (binds ciphertext to file location)
  const relativePath = path.relative(repoPath, filePath);
  const aad = relativePath.replace(/\\/g, '/'); // Normalize path separators

  // Encrypt with DEK and AAD binding (keeps your security feature!)
  const encrypted = await encryptWithDEK(plaintext, dek, aad);

  // Write encrypted file
  await fs.writeFile(filePath + ".enc", encrypted);
}

export async function POST(request: NextRequest) {
  try {
    const { repoPath, message, author, dekBase64 } = await request.json();

    if (!repoPath || !message) {
      return NextResponse.json(
        { error: "Repository path and commit message are required" },
        { status: 400 }
      );
    }

    // If DEK provided, encrypt all .md files before committing
    if (dekBase64) {
      const dek = base64Decode(dekBase64);
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
              await encryptFile(fullPath, dek, repoPath);
            }
          }
        } catch (error) {
          // Directory might not exist yet
        }
      }

      await encryptMarkdownFiles(notesPath);

      // Add encrypted files to git
      await execAsync("git add **/*.md.enc", { cwd: repoPath });

      // Add other safe files (config, kanban .enc, etc.) but NOT plaintext .md files
      // Use individual commands and ignore errors if paths don't exist
      try {
        await execAsync("git add .holocron/", { cwd: repoPath });
      } catch (e) {
        // .holocron might not have changes
      }
      try {
        await execAsync("git add kanban/**/*.json.enc", { cwd: repoPath });
      } catch (e) {
        // kanban might not exist or have .enc files
      }
      try {
        await execAsync("git add README.md .gitignore", { cwd: repoPath });
      } catch (e) {
        // These files might not exist
      }
    } else {
      // No encryption - stage all changes
      await execAsync("git add -A", { cwd: repoPath });
    }

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
