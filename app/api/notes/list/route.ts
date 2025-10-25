import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";
import matter from "gray-matter";

export async function GET(request: NextRequest) {
  try {
    const repoPath = request.nextUrl.searchParams.get("repoPath");

    if (!repoPath) {
      return NextResponse.json(
        { error: "Repository path is required" },
        { status: 400 }
      );
    }

    const notesPath = path.join(repoPath, "notes");

    // Recursively get all .md files
    async function getMarkdownFiles(dir: string, baseDir: string = dir): Promise<any[]> {
      const files: any[] = [];

      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            const subFiles = await getMarkdownFiles(fullPath, baseDir);
            files.push(...subFiles);
          } else if (entry.isFile() && entry.name.endsWith(".md")) {
            const stats = await fs.stat(fullPath);
            const relativePath = path.relative(baseDir, fullPath);

            // Parse frontmatter to extract type
            let noteType = "note";
            try {
              const content = await fs.readFile(fullPath, "utf-8");
              const { data } = matter(content);
              noteType = data.type || "note";
            } catch (error) {
              // If parsing fails, default to "note"
              console.warn(`Failed to parse frontmatter for ${fullPath}:`, error);
            }

            files.push({
              name: entry.name,
              path: relativePath,
              fullPath,
              modified: stats.mtime.toISOString(),
              size: stats.size,
              type: noteType,
            });
          }
        }
      } catch (error) {
        // Directory might not exist yet
        return [];
      }

      return files;
    }

    const notes = await getMarkdownFiles(notesPath);

    return NextResponse.json({
      notes,
      count: notes.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to list notes" },
      { status: 500 }
    );
  }
}
