import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RepoProvider } from "@/contexts/RepoContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LocalNote",
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
        <RepoProvider>{children}</RepoProvider>
      </body>
    </html>
  );
}
