"use client";

import React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES } from "@/lib/editor/codeBlockLanguages";

interface CodeBlockHeaderProps {
  language: string;
  onLanguageChange: (value: string) => void;
  copied: boolean;
  onCopy: () => void;
}

export const CodeBlockHeader = React.memo(function CodeBlockHeader({
  language,
  onLanguageChange,
  copied,
  onCopy,
}: CodeBlockHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-muted/50 px-4 py-2 rounded-t-lg border-b border-border">
      <Select value={language} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-[180px] h-8 text-xs">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((lang) => (
            <SelectItem
              key={lang.value || "null"}
              value={lang.value || "null"}
              className="text-xs"
            >
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={onCopy}
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        title={copied ? "Copied!" : "Copy code"}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
});
