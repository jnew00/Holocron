import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";
import { decryptWithDEK, base64Decode } from "@/lib/crypto/unified";

const execAsync = promisify(exec);

// Decrypt a file using DEK (NEW - much faster than PBKDF2!)
async function decryptFile(encFilePath: string, dek: Uint8Array, repoPath: string): Promise<void> {
  const encryptedData = await fs.readFile(encFilePath);

  // Calculate relative path for AAD (must match encryption AAD)
  const outputPath = encFilePath.replace(/\.enc$/, "");
  const relativePath = path.relative(repoPath, outputPath);
  const aad = relativePath.replace(/\\/g, '/'); // Normalize path separators

  // Decrypt with DEK and AAD verification (keeps your security feature!)
  const decrypted = await decryptWithDEK(new Uint8Array(encryptedData), dek, aad);

  // Write decrypted file
  await fs.writeFile(outputPath, Buffer.from(decrypted), "utf-8");
}

export async function POST(request: NextRequest) {
  try {
    const { repoPath, remote = "origin", branch, dekBase64 } = await request.json();

    if (!repoPath) {
      return NextResponse.json(
        { error: "Repository path is required" },
        { status: 400 }
      );
    }

    // Get current branch if not specified
    let targetBranch = branch;
    if (!targetBranch) {
      const { stdout } = await execAsync("git branch --show-current", {
        cwd: repoPath,
      });
      targetBranch = stdout.trim();
    }

    // Pull from remote (will use existing SSH credentials)
    const { stdout, stderr } = await execAsync(
      `git pull ${remote} ${targetBranch}`,
      { cwd: repoPath }
    );

    // Check if there are conflicts
    const hasConflicts =
      stdout.includes("CONFLICT") || stderr.includes("CONFLICT");

    if (hasConflicts) {
      // Get list of conflicted files
      const { stdout: conflictFiles } = await execAsync(
        "git diff --name-only --diff-filter=U",
        { cwd: repoPath }
      );

      return NextResponse.json({
        success: false,
        hasConflicts: true,
        conflictedFiles: conflictFiles.trim().split("\n").filter(Boolean),
        output: stdout || stderr,
      });
    }

    // If DEK provided, decrypt all pulled .md.enc files
    if (dekBase64) {
      const dek = base64Decode(dekBase64);
      const notesPath = path.join(repoPath, "notes");

      // Recursively find and decrypt all .md.enc files
      async function decryptMarkdownFiles(dir: string): Promise<void> {
        try {
          const entries = await fs.readdir(dir, { withFileTypes: true });

          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
              await decryptMarkdownFiles(fullPath);
            } else if (entry.isFile() && entry.name.endsWith(".md.enc")) {
              try {
                await decryptFile(fullPath, dek, repoPath);
              } catch (error) {
                console.error(`Failed to decrypt ${fullPath}:`, error);
              }
            }
          }
        } catch (error) {
          // Directory might not exist yet
        }
      }

      await decryptMarkdownFiles(notesPath);
    }

    return NextResponse.json({
      success: true,
      hasConflicts: false,
      output: stdout || stderr,
    });
  } catch (error: any) {
    // Check for specific error conditions
    if (error.message.includes("no tracking information")) {
      return NextResponse.json(
        {
          error:
            "No upstream branch configured. Run: git branch --set-upstream-to=origin/<branch>",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to pull" },
      { status: 500 }
    );
  }
}
