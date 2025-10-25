"use client";

import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/contexts/SettingsContext";

// Popular programming languages
const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "shell", label: "Shell" },
  { value: "powershell", label: "PowerShell" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "plaintext", label: "Plain Text" },
  { value: null, label: "Auto Detect" },
];

export function CodeBlockComponent({
  node,
  updateAttributes,
  extension,
}: {
  node: ProseMirrorNode;
  updateAttributes: (attributes: Record<string, any>) => void;
  extension: any;
}) {
  const [copied, setCopied] = useState(false);
  const { settings } = useSettings();

  const copyToClipboard = async () => {
    const code = node.textContent;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleLanguageChange = (value: string) => {
    updateAttributes({ language: value === "null" ? null : value });
  };

  // If language selector is disabled, show simpler header with just copy button
  if (!settings.showCodeBlockLanguageSelector) {
    return (
      <NodeViewWrapper className="relative code-block">
        <pre>
          <Button
            onClick={copyToClipboard}
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
          <NodeViewContent as="code" />
        </pre>
      </NodeViewWrapper>
    );
  }

  // Show full header with language selector
  return (
    <NodeViewWrapper className="relative code-block">
      <div className="flex items-center justify-between bg-muted/50 px-4 py-2 rounded-t-lg border-b border-border">
        <Select
          value={node.attrs.language || "null"}
          onValueChange={handleLanguageChange}
        >
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
          onClick={copyToClipboard}
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
      <pre className="rounded-t-none">
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
}
