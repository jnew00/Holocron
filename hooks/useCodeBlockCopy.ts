"use client";

import { useState, useCallback } from "react";

interface UseCodeBlockCopyReturn {
  copied: boolean;
  copyToClipboard: () => Promise<void>;
}

export function useCodeBlockCopy(nodeContent: string): UseCodeBlockCopyReturn {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(nodeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [nodeContent]);

  return { copied, copyToClipboard };
}
