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

            // Parse frontmatter and extract title from content
            let noteType = "note";
            let title = entry.name.replace(".md", "")
              .split("-")
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            try {
              const content = await fs.readFile(fullPath, "utf-8");
              const { data, content: markdownContent } = matter(content);
              noteType = data.type || "note";

              // Extract title from first H1 in content
              const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
              if (titleMatch) {
                title = titleMatch[1];
              }
            } catch (error) {
              // If parsing fails, default to "note" and filename-based title
              console.warn(`Failed to parse frontmatter for ${fullPath}:`, error);
            }

            files.push({
              name: entry.name,
              path: relativePath,
              fullPath,
              modified: stats.mtime.toISOString(),
              size: stats.size,
              type: noteType,
              title,
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
