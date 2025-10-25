"use client";

import React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeBlockSimpleProps {
  copied: boolean;
  onCopy: () => void;
  children: React.ReactNode;
}

export const CodeBlockSimple = React.memo(function CodeBlockSimple({
  copied,
  onCopy,
  children,
}: CodeBlockSimpleProps) {
  return (
    <pre>
      <Button
        onClick={onCopy}
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100 z-10"
        title={copied ? "Copied!" : "Copy code"}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
      {children}
    </pre>
  );
});
