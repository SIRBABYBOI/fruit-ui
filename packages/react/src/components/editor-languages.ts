import type { Extension } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { markdown } from "@codemirror/lang-markdown";
import { zig } from "codemirror-lang-zig";

export type BuiltInEditorLanguage =
  | "zig"
  | "javascript"
  | "typescript"
  | "json"
  | "html"
  | "css"
  | "markdown"
  | "text";

/**
 * Custom language names map to functions that create CodeMirror extensions.
 */
export type EditorLanguageExtensions = Record<string, () => Extension>;

export function detectEditorLanguage(fileName?: string): BuiltInEditorLanguage {
  if (!fileName) {
    return "text";
  }

  const name = fileName.toLowerCase();

  if (name.endsWith(".zig")) return "zig";

  if (name.endsWith(".ts") || name.endsWith(".tsx")) {
    return "typescript";
  }

  if (
    name.endsWith(".js") ||
    name.endsWith(".jsx") ||
    name.endsWith(".mjs") ||
    name.endsWith(".cjs")
  ) {
    return "javascript";
  }

  if (name.endsWith(".json")) return "json";
  if (name.endsWith(".html") || name.endsWith(".htm")) return "html";
  if (name.endsWith(".css")) return "css";
  if (name.endsWith(".md") || name.endsWith(".markdown")) return "markdown";

  return "text";
}

export function getEditorLanguageExtension(
  language: string,
  customLanguages: EditorLanguageExtensions = {},
): Extension {
  const name = language.toLowerCase();

  // An application can add a new language or ovveride a built-in one.
  const custom = customLanguages[name];

  if (custom) {
    return custom();
  }

  switch (name) {
    case "zig":
      return zig();

    case "javascript":
      return javascript({ jsx: true });

    case "typescript":
      return javascript({ typescript: true, jsx: true });

    case "json":
      return json();

    case "html":
      return html();

    case "css":
      return css();

    case "markdown":
      return markdown();

    case "text":
    default:
      return [];
  }
}
