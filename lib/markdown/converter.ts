/**
 * Markdown conversion utilities for Tiptap editor
 * Converts between Tiptap JSON and Markdown format
 */

import { JSONContent } from "@tiptap/core";

/**
 * Convert Tiptap JSON content to Markdown
 */
export function jsonToMarkdown(content: JSONContent): string {
  if (!content) return "";

  let markdown = "";

  const processNode = (node: JSONContent, level = 0, itemIndex?: number): string => {
    let result = "";

    switch (node.type) {
      case "doc":
        if (node.content) {
          result = node.content.map((child) => processNode(child, level)).join("");
        }
        break;

      case "heading":
        const headingLevel = node.attrs?.level || 1;
        const headingText = node.content
          ? node.content.map((child) => processNode(child, level)).join("")
          : "";
        result = `${"#".repeat(headingLevel)} ${headingText}\n\n`;
        break;

      case "paragraph":
        const paragraphText = node.content
          ? node.content.map((child) => processNode(child, level)).join("")
          : "";
        result = paragraphText ? `${paragraphText}\n\n` : "\n";
        break;

      case "text":
        let text = node.text || "";
        if (node.marks) {
          node.marks.forEach((mark) => {
            switch (mark.type) {
              case "bold":
                text = `**${text}**`;
                break;
              case "italic":
                text = `*${text}*`;
                break;
              case "code":
                text = `\`${text}\``;
                break;
              case "strike":
                text = `~~${text}~~`;
                break;
              case "link":
                text = `[${text}](${mark.attrs?.href || ""})`;
                break;
            }
          });
        }
        result = text;
        break;

      case "codeBlock":
        const language = node.attrs?.language || "";
        const code = node.content
          ? node.content.map((child) => processNode(child, level)).join("")
          : "";
        result = `\`\`\`${language}\n${code}\`\`\`\n\n`;
        break;

      case "blockquote":
        const quoteContent = node.content
          ? node.content
              .map((child) => processNode(child, level))
              .join("")
              .split("\n")
              .filter((line) => line.trim())
              .map((line) => `> ${line}`)
              .join("\n")
          : "";
        result = `${quoteContent}\n\n`;
        break;

      case "bulletList":
        if (node.content) {
          result = node.content.map((child) => processNode(child, level)).join("");
        }
        if (level === 0) result += "\n";
        break;

      case "orderedList":
        if (node.content) {
          result = node.content
            .map((child, index) => processNode(child, level, index + 1))
            .join("");
        }
        if (level === 0) result += "\n";
        break;

      case "listItem":
        const indent = "  ".repeat(level);
        const marker = typeof itemIndex === "number" ? `${itemIndex}.` : "-";
        const itemContent = node.content
          ? node.content
              .map((child) => {
                if (child.type === "paragraph") {
                  return child.content
                    ? child.content.map((c) => processNode(c, level + 1)).join("")
                    : "";
                }
                return processNode(child, level + 1);
              })
              .join("")
          : "";
        result = `${indent}${marker} ${itemContent}\n`;
        break;

      case "taskList":
        if (node.content) {
          result = node.content.map((child) => processNode(child, level)).join("");
        }
        if (level === 0) result += "\n";
        break;

      case "taskItem":
        const checked = node.attrs?.checked ? "x" : " ";
        const taskIndent = "  ".repeat(level);
        const taskContent = node.content
          ? node.content
              .map((child) => {
                if (child.type === "paragraph") {
                  return child.content
                    ? child.content.map((c) => processNode(c, level + 1)).join("")
                    : "";
                }
                return processNode(child, level + 1);
              })
              .join("")
          : "";
        result = `${taskIndent}- [${checked}] ${taskContent}\n`;
        break;

      case "horizontalRule":
        result = "---\n\n";
        break;

      case "hardBreak":
        result = "  \n";
        break;

      default:
        if (node.content) {
          result = node.content.map((child) => processNode(child, level)).join("");
        }
        break;
    }

    return result;
  };

  markdown = processNode(content);
  return markdown.trim() + "\n";
}

/**
 * Convert Markdown to Tiptap JSON content
 * This is a basic implementation - for production, consider using a proper markdown parser
 */
export function markdownToJson(markdown: string): JSONContent {
  const lines = markdown.split("\n");
  const content: JSONContent[] = [];
  let currentParagraph: string[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLanguage = "";

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join("\n").trim();
      if (text) {
        content.push({
          type: "paragraph",
          content: parseInlineContent(text),
        });
      }
      currentParagraph = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      if (!inCodeBlock) {
        flushParagraph();
        inCodeBlock = true;
        codeBlockLanguage = line.slice(3).trim();
        codeBlockContent = [];
      } else {
        content.push({
          type: "codeBlock",
          attrs: { language: codeBlockLanguage },
          content: [{ type: "text", text: codeBlockContent.join("\n") }],
        });
        inCodeBlock = false;
        codeBlockContent = [];
        codeBlockLanguage = "";
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      content.push({
        type: "heading",
        attrs: { level: headingMatch[1].length },
        content: parseInlineContent(headingMatch[2]),
      });
      continue;
    }

    // Horizontal rule
    if (line.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
      flushParagraph();
      content.push({ type: "horizontalRule" });
      continue;
    }

    // Task list item
    const taskMatch = line.match(/^(\s*)-\s+\[([x ])\]\s+(.+)$/i);
    if (taskMatch) {
      flushParagraph();
      content.push({
        type: "taskItem",
        attrs: { checked: taskMatch[2].toLowerCase() === "x" },
        content: [
          {
            type: "paragraph",
            content: parseInlineContent(taskMatch[3]),
          },
        ],
      });
      continue;
    }

    // Bullet list item
    const bulletMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
    if (bulletMatch) {
      flushParagraph();
      content.push({
        type: "listItem",
        content: [
          {
            type: "paragraph",
            content: parseInlineContent(bulletMatch[2]),
          },
        ],
      });
      continue;
    }

    // Ordered list item
    const orderedMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      content.push({
        type: "listItem",
        content: [
          {
            type: "paragraph",
            content: parseInlineContent(orderedMatch[2]),
          },
        ],
      });
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      flushParagraph();
      content.push({
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: parseInlineContent(line.slice(2)),
          },
        ],
      });
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      flushParagraph();
      continue;
    }

    // Regular paragraph line
    currentParagraph.push(line);
  }

  flushParagraph();

  return {
    type: "doc",
    content: content.length > 0 ? content : [{ type: "paragraph" }],
  };
}

/**
 * Parse inline markdown content (bold, italic, code, links, etc.)
 */
function parseInlineContent(text: string): JSONContent[] {
  const content: JSONContent[] = [];
  let current = text;
  let position = 0;

  // Simple regex-based parsing for inline elements
  const patterns = [
    { regex: /\*\*(.+?)\*\*/g, mark: "bold" },
    { regex: /\*(.+?)\*/g, mark: "italic" },
    { regex: /`(.+?)`/g, mark: "code" },
    { regex: /~~(.+?)~~/g, mark: "strike" },
    { regex: /\[(.+?)\]\((.+?)\)/g, mark: "link" },
  ];

  // For simplicity, just handle text without complex inline parsing
  // A production implementation would need a proper markdown parser
  if (text) {
    content.push({ type: "text", text });
  }

  return content.length > 0 ? content : [{ type: "text", text: "" }];
}
