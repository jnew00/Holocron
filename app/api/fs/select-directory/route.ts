import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import * as os from "os";

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    const platform = os.platform();
    let directoryPath: string | null = null;

    if (platform === "darwin") {
      // macOS - use AppleScript
      const script = `
        osascript -e 'tell application "System Events"
          activate
          set folderPath to choose folder with prompt "Select your notes directory"
          return POSIX path of folderPath
        end tell'
      `;

      try {
        const { stdout } = await execAsync(script);
        directoryPath = stdout.trim();
      } catch (error: any) {
        // User cancelled or error occurred
        return NextResponse.json(
          { error: "Folder selection cancelled", cancelled: true },
          { status: 400 }
        );
      }
    } else if (platform === "win32") {
      // Windows - use PowerShell
      const script = `
        Add-Type -AssemblyName System.Windows.Forms
        $dialog = New-Object System.Windows.Forms.FolderBrowserDialog
        $dialog.Description = 'Select your notes directory'
        $dialog.RootFolder = 'MyComputer'
        $result = $dialog.ShowDialog()
        if ($result -eq 'OK') {
          Write-Output $dialog.SelectedPath
        }
      `;

      try {
        const { stdout } = await execAsync(`powershell -Command "${script.replace(/"/g, '\\"')}"`);
        directoryPath = stdout.trim();
      } catch (error: any) {
        return NextResponse.json(
          { error: "Folder selection cancelled", cancelled: true },
          { status: 400 }
        );
      }
    } else {
      // Linux - use zenity or kdialog
      try {
        // Try zenity first (GNOME)
        const { stdout } = await execAsync('zenity --file-selection --directory --title="Select your notes directory"');
        directoryPath = stdout.trim();
      } catch (error) {
        try {
          // Try kdialog (KDE)
          const { stdout } = await execAsync('kdialog --getexistingdirectory . "Select your notes directory"');
          directoryPath = stdout.trim();
        } catch (error) {
          return NextResponse.json(
            { error: "No supported file dialog found. Please install zenity or kdialog." },
            { status: 500 }
          );
        }
      }
    }

    if (!directoryPath) {
      return NextResponse.json(
        { error: "No directory selected", cancelled: true },
        { status: 400 }
      );
    }

    return NextResponse.json({
      path: directoryPath,
    });
  } catch (error: any) {
    console.error("Error selecting directory:", error);
    return NextResponse.json(
      { error: error.message || "Failed to select directory" },
      { status: 500 }
    );
  }
}
