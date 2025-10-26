import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path: repoPath } = body;

    if (!repoPath) {
      return NextResponse.json(
        { error: "Path is required" },
        { status: 400 }
      );
    }

    // Create .holocron directory structure
    const holocronPath = path.join(repoPath, ".holocron");
    await fs.mkdir(holocronPath, { recursive: true });

    // Create subdirectories
    await fs.mkdir(path.join(repoPath, "notes"), { recursive: true });
    await fs.mkdir(path.join(repoPath, "assets"), { recursive: true });
    await fs.mkdir(path.join(repoPath, "kanban"), { recursive: true });

    // NOTE: We do NOT create a .gitignore for .md files
    // In v2.0, both .md and .md.enc files can be in git
    // The commit process will handle encryption
    // Users can add their own .gitignore if they want different behavior

    // Note: Config file is now created by the setup wizard with wrapped DEK
    // No need to create it here - wizard will create config.json (v2.0) with encryption metadata

    return NextResponse.json({
      success: true,
      message: "Repository initialized successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to initialize repository" },
      { status: 500 }
    );
  }
}
