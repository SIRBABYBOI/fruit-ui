import type { FileTreeNode } from "@fruitui/core";
import {
  File,
  FileCode2,
  FileJson,
  FileText,
  Folder,
  FolderOpen,
} from "lucide-react";

export interface FileTreeIconProps {
  node: FileTreeNode;
  expanded: boolean;
}

export function FileTreeIcon({ node, expanded }: FileTreeIconProps) {
  if (node.type === "folder") {
    return expanded ? (
      <FolderOpen size={14} aria-hidden="true" />
    ) : (
      <Folder size={14} aria-hidden="true" />
    );
  }

  const name = node.name.toLowerCase();

  if (name.endsWith(".json")) {
    return <FileJson size={14} aria-hidden="true" />;
  }

  if (
    name.endsWith(".zig") ||
    name.endsWith(".ts") ||
    name.endsWith(".tsx") ||
    name.endsWith(".js") ||
    name.endsWith(".jsx")
  ) {
    return <FileCode2 size={14} aria-hidden="true" />;
  }

  if (name.endsWith(".md") || name.endsWith(".txt")) {
    return <FileText size={14} aria-hidden="true" />;
  }

  return <File size={14} aria-hidden="true" />;
}
