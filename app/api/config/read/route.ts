import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";
import { decryptWithMachineKey } from "@/lib/security/machineKey";

export async function GET(request: NextRequest) {
  try {
    const repoPath = request.nextUrl.searchParams.get("repoPath");

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

      // Decrypt using machine-specific key
      const decryptedJson = decryptWithMachineKey(encryptedData);
      const config = JSON.parse(decryptedJson);

      return NextResponse.json({
        success: true,
        config,
      });
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
