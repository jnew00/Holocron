import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";

export async function GET(request: NextRequest) {
  try {
    const repoPath = request.nextUrl.searchParams.get("path");

    if (!repoPath) {
      return NextResponse.json(
        { error: "Path is required" },
        { status: 400 }
      );
    }

    // Check if .holocron directory exists
    const holocronPath = path.join(repoPath, ".holocron");

    try {
      const stats = await fs.stat(holocronPath);
      const isValid = stats.isDirectory();

      return NextResponse.json({
        isValid,
      });
    } catch (error) {
      // Directory doesn't exist
      return NextResponse.json({
        isValid: false,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to check repository" },
      { status: 500 }
    );
  }
}
