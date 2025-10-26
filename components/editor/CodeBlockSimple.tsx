"use client";

import React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeBlockSimpleProps {
  copied: boolean;
  onCopy: () => void;
  children: React.ReactElement;
  className?: string;
  codeClassName?: string;
  dataLanguage?: string;
}

export const CodeBlockSimple = React.memo(function CodeBlockSimple({
  copied,
  onCopy,
  children,
  className,
  codeClassName,
  dataLanguage,
}: CodeBlockSimpleProps) {
  const content = React.cloneElement(children, {
    className: cn((children.props as { className?: string }).className, codeClassName),
    "data-language": dataLanguage,
  } as Partial<unknown>);

  return (
    <pre className={cn("group relative hljs", className)} data-language={dataLanguage}>
      <Button
        onClick={onCopy}
        variant="secondary"
        size="sm"
        className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-border/60 bg-background/85 text-foreground shadow-sm hover:bg-background"
        title={copied ? "Copied!" : "Copy code"}
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-400" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
      {content}
    </pre>
  );
});
