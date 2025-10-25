"use client";

import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { useSettings } from "@/contexts/SettingsContext";
import { useCodeBlockCopy } from "@/hooks/useCodeBlockCopy";
import { CodeBlockHeader } from "./CodeBlockHeader";
import { CodeBlockSimple } from "./CodeBlockSimple";

export function CodeBlockComponent({
  node,
  updateAttributes,
  extension,
}: {
  node: ProseMirrorNode;
  updateAttributes: (attributes: Record<string, any>) => void;
  extension: any;
}) {
  const { copied, copyToClipboard } = useCodeBlockCopy(node.textContent);
  const { settings } = useSettings();

  const handleLanguageChange = (value: string) => {
    updateAttributes({ language: value === "null" ? null : value });
  };

  if (!settings.showCodeBlockLanguageSelector) {
    return (
      <NodeViewWrapper className="relative code-block">
        <CodeBlockSimple copied={copied} onCopy={copyToClipboard}>
          <NodeViewContent as="div" />
        </CodeBlockSimple>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="relative code-block">
      <CodeBlockHeader
        language={node.attrs.language || "null"}
        onLanguageChange={handleLanguageChange}
        copied={copied}
        onCopy={copyToClipboard}
      />
      <pre className="rounded-t-none">
        <NodeViewContent as="div" />
      </pre>
    </NodeViewWrapper>
  );
}
