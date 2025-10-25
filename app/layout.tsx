import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RepoProvider } from "@/contexts/RepoContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AutoSyncManager } from "@/components/git/AutoSyncManager";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Holocron",
  description: "Personal, local-first encrypted note-taker with mini-kanban",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SettingsProvider>
          <RepoProvider>
            <AutoSyncManager />
            {children}
          </RepoProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
