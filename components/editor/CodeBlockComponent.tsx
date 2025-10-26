"use client";

import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { useSettings } from "@/contexts/SettingsContext";
import { useCodeBlockCopy } from "@/hooks/useCodeBlockCopy";
import { CodeBlockHeader } from "./CodeBlockHeader";
import { CodeBlockSimple } from "./CodeBlockSimple";
import { cn } from "@/lib/utils";

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
  const language = typeof node.attrs.language === "string" ? node.attrs.language : null;
  const languageClass = language ? `language-${language}` : "language-auto";
  const dataLanguage = language ?? "auto";
  const selectValue = language ?? "null";

  const handleLanguageChange = (value: string) => {
    updateAttributes({ language: value === "null" ? null : value });
  };

  if (!settings.showCodeBlockLanguageSelector) {
    return (
      <NodeViewWrapper
        className="relative code-block"
        data-language={dataLanguage}
      >
        <CodeBlockSimple
          copied={copied}
          onCopy={copyToClipboard}
          className={languageClass}
          codeClassName={languageClass}
          dataLanguage={dataLanguage}
        >
          <NodeViewContent as="code" />
        </CodeBlockSimple>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper
      className="relative code-block"
      data-language={dataLanguage}
    >
      <CodeBlockHeader
        language={selectValue}
        onLanguageChange={handleLanguageChange}
        copied={copied}
        onCopy={copyToClipboard}
      />
      <pre className={cn("rounded-t-none hljs", languageClass)} data-language={dataLanguage}>
        <NodeViewContent as="code" className={languageClass} data-language={dataLanguage} />
      </pre>
    </NodeViewWrapper>
  );
}
