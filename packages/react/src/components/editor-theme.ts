import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";

export type EditorTheme = "dark" | "light";

export function createEditorTheme(theme: EditorTheme) {
  const dark = theme === "dark";

  const colors = dark
    ? {
        background: "var(--fruit-bg, #111114)",
        panel: "var(--fruit-panel, #18181c)",
        border: "var(--fruit-border, #29292f)",
        text: "var(--fruit-text, #e8e8ed)",
        muted: "var(--fruit-muted, #858590)",
        accent: "var(--fruit-accent, #b7e36b)",
        selection: "#3d5140",
        activeLine: "#1b1d20",
        keyword: "#c792ea",
        string: "#c3e88d",
        number: "#f78c6c",
        comment: "#a3a3ad",
        type: "#82aaff",
        variable: "#e8e8ed",
      }
    : {
        background: "var(--fruit-editor-light-bg, #ffffff)",
        panel: "var(--fruit-editor-light-panel, #f2f3f5)",
        border: "var(--fruit-editor-light-border, #d1d5db)",
        text: "var(--fruit-editor-light-text, #1f2937)",
        muted: "var(--fruit-editor-light-muted, #596579)",
        accent: "var(--fruit-editor-light-accent, #3f6212)",
        selection: "#d8e8c7",
        activeLine: "#f3f5f1",
        keyword: "#7e22a8",
        string: "#3f6212",
        number: "#b45309",
        comment: "#526175",
        type: "#1d4ed8",
        variable: "#1f2937",
      };

  const editorTheme = EditorView.theme(
    {
      "&": {
        height: "100%",
        color: colors.text,
        backgroundColor: colors.background,
        fontSize: "13px",
      },

      ".cm-scroller": {
        overflow: "auto",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      },

      ".cm-content": {
        caretColor: colors.accent,
        padding: "12px 0",
      },

      ".cm-line": {
        padding: "0 12px",
      },

      "&.cm-focused": {
        outline: "none",
      },

      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: colors.accent,
      },

      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection":
        {
          backgroundColor: colors.selection,
        },

      ".cm-activeLine": {
        backgroundColor: colors.activeLine,
      },

      ".cm-gutters": {
        color: colors.muted,
        backgroundColor: colors.panel,
        borderRight: `1px solid ${colors.border}`,
      },

      ".cm-activeLineGutter": {
        color: colors.text,
        backgroundColor: colors.activeLine,
      },
    },
    { dark },
  );

  const highlightStyle = HighlightStyle.define([
    {
      tag: [tags.keyword, tags.modifier, tags.operatorKeyword],
      color: colors.keyword,
    },
    {
      tag: [tags.string, tags.special(tags.string)],
      color: colors.string,
    },
    {
      tag: [tags.number, tags.bool, tags.null],
      color: colors.number,
    },
    {
      tag: [tags.comment, tags.lineComment, tags.blockComment],
      color: colors.comment,
      fontStyle: "italic",
    },
    {
      tag: [tags.typeName, tags.className],
      color: colors.type,
    },
    {
      tag: [tags.variableName, tags.propertyName],
      color: colors.variable,
    },
  ]);

  return [editorTheme, syntaxHighlighting(highlightStyle)];
}
