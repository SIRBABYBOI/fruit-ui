import { useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import type { FileTreeNode } from "@fruitui/core";
import { ChevronDown, ChevronRight } from "lucide-react";

import { FileTreeIcon } from "./file-tree-icon";

export interface FileTreeProps {
  nodes: FileTreeNode[];

  expandedIds: string[];
  onExpandedChange: (ids: string[]) => void;

  selectedId: string | null;
  onSelect: (node: FileTreeNode) => void;

  label?: string;

  /**
   * Return a custom icon for a node.
   * Return undefined to use FruitUI's default icon.
   */
  renderIcon?: (node: FileTreeNode, expanded: boolean) => ReactNode | undefined;

  /**
   * Operation callbacks. The application decides what each action does.
   */
  onCreateFile?: (folder: FileTreeNode) => void;
  onCreateFolder?: (folder: FileTreeNode) => void;
  onRename?: (node: FileTreeNode) => void;
  onDelete?: (node: FileTreeNode) => void;
  onRefresh?: (folder: FileTreeNode) => void;
}

interface VisibleNode {
  node: FileTreeNode;
  parentId: string | null;
}

export function FileTree({
  nodes,
  expandedIds,
  onExpandedChange,
  selectedId,
  onSelect,
  label = "Files",
  renderIcon,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
  onRefresh,
}: FileTreeProps) {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const itemRefs = useRef(new Map<string, HTMLDivElement>());

  const expanded = new Set(expandedIds);
  const visibleNodes: VisibleNode[] = [];

  function collectVisible(items: FileTreeNode[], parentId: string | null) {
    for (const node of items) {
      visibleNodes.push({ node, parentId });

      if (node.type === "folder" && expanded.has(node.id)) {
        collectVisible(node.children, node.id);
      }
    }
  }

  collectVisible(nodes, null);

  const activeFocusId = visibleNodes.some(({ node }) => node.id === focusedId)
    ? focusedId
    : (visibleNodes[0]?.node.id ?? null);

  function focusNode(id: string) {
    setFocusedId(id);
    (itemRefs.current.get(id) as { focus: () => void } | undefined)?.focus();
  }

  function toggleFolder(id: string) {
    if (expanded.has(id)) {
      onExpandedChange(expandedIds.filter((expandedId) => expandedId !== id));
    } else {
      onExpandedChange([...expandedIds, id]);
    }
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
    node: FileTreeNode,
  ) {
    const index = visibleNodes.findIndex((item) => item.node.id === node.id);
    const current = visibleNodes[index];

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        const next = visibleNodes[index + 1];

        if (next) {
          focusNode(next.node.id);
        }

        break;
      }

      case "ArrowUp": {
        event.preventDefault();
        const previous = visibleNodes[index - 1];

        if (previous) {
          focusNode(previous.node.id);
        }

        break;
      }

      case "Home": {
        event.preventDefault();
        const first = visibleNodes[0];

        if (first) {
          focusNode(first.node.id);
        }

        break;
      }

      case "End": {
        event.preventDefault();
        const last = visibleNodes[visibleNodes.length - 1];

        if (last) {
          focusNode(last.node.id);
        }

        break;
      }

      case "ArrowRight": {
        event.preventDefault();

        if (node.type !== "folder") {
          break;
        }

        if (!expanded.has(node.id)) {
          toggleFolder(node.id);
        } else if (node.children[0]) {
          focusNode(node.children[0].id);
        }

        break;
      }

      case "ArrowLeft": {
        event.preventDefault();

        if (node.type === "folder" && expanded.has(node.id)) {
          toggleFolder(node.id);
        } else if (current?.parentId) {
          focusNode(current.parentId);
        }

        break;
      }

      case "Enter":
      case " ": {
        event.preventDefault();

        if (node.type === "folder") {
          toggleFolder(node.id);
        } else {
          onSelect(node);
        }

        break;
      }
    }
  }

  function renderNodes(items: FileTreeNode[], depth: number): ReactNode {
    return items.map((node) => {
      const isFolder = node.type === "folder";
      const isExpanded = isFolder && expanded.has(node.id);
      const isSelected = !isFolder && selectedId === node.id;

      const hasMenu =
        Boolean(onRename || onDelete) ||
        (isFolder && Boolean(onCreateFile || onCreateFolder || onRefresh));

      const row = (
        <div
          className={`flex cursor-pointer items-center gap-1 rounded py-1 pr-2 text-xs ${
            isSelected
              ? "bg-fruit-accent/10 text-fruit-accent"
              : "text-fruit-text hover:bg-white/5"
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            focusNode(node.id);

            if (node.type === "folder") {
              toggleFolder(node.id);
            } else {
              onSelect(node);
            }
          }}
          onContextMenu={() => {
            focusNode(node.id);
          }}
        >
          {isFolder ? (
            isExpanded ? (
              <ChevronDown size={14} aria-hidden="true" />
            ) : (
              <ChevronRight size={14} aria-hidden="true" />
            )
          ) : (
            <span className="w-3.5 shrink-0" />
          )}

          {renderIcon?.(node, isExpanded) ?? (
            <FileTreeIcon node={node} expanded={isExpanded} />
          )}

          <span className="truncate">{node.name}</span>
        </div>
      );

      return (
        <div
          key={node.id}
          role="treeitem"
          aria-expanded={isFolder ? isExpanded : undefined}
          aria-selected={isFolder ? undefined : isSelected}
          tabIndex={activeFocusId === node.id ? 0 : -1}
          className="rounded focus-visible:outline-2 focus-visible:outline-fruit-accent"
          ref={(element) => {
            if (element) {
              itemRefs.current.set(node.id, element);
            } else {
              itemRefs.current.delete(node.id);
            }
          }}
          onFocus={(event) => {
            if (event.target === event.currentTarget) {
              setFocusedId(node.id);
            }
          }}
          onKeyDown={(event) => {
            if (event.target === event.currentTarget) {
              handleKeyDown(event, node);
            }
          }}
        >
          {hasMenu ? (
            <ContextMenu.Root>
              <ContextMenu.Trigger asChild>{row}</ContextMenu.Trigger>

              <ContextMenu.Portal>
                <ContextMenu.Content className="z-50 min-w-40 rounded border border-fruit-border bg-fruit-panel p-1 text-xs text-fruit-text shadow-lg">
                  {node.type === "folder" && onCreateFile && (
                    <ContextMenu.Item
                      className="cursor-pointer rounded px-3 py-2 outline-none hover:bg-white/10 focus:bg-white/10"
                      onSelect={() => onCreateFile(node)}
                    >
                      New file
                    </ContextMenu.Item>
                  )}

                  {node.type === "folder" && onCreateFolder && (
                    <ContextMenu.Item
                      className="cursor-pointer rounded px-3 py-2 outline-none hover:bg-white/10 focus:bg-white/10"
                      onSelect={() => onCreateFolder(node)}
                    >
                      New folder
                    </ContextMenu.Item>
                  )}

                  {node.type === "folder" && onRefresh && (
                    <ContextMenu.Item
                      className="cursor-pointer rounded px-3 py-2 outline-none hover:bg-white/10 focus:bg-white/10"
                      onSelect={() => onRefresh(node)}
                    >
                      Refresh
                    </ContextMenu.Item>
                  )}

                  {onRename && (
                    <ContextMenu.Item
                      className="cursor-pointer rounded px-3 py-2 outline-none hover:bg-white/10 focus:bg-white/10"
                      onSelect={() => onRename(node)}
                    >
                      Rename
                    </ContextMenu.Item>
                  )}

                  {onDelete && (
                    <ContextMenu.Item
                      className="cursor-pointer rounded px-3 py-2 outline-none hover:bg-white/10 focus:bg-white/10"
                      onSelect={() => onDelete(node)}
                    >
                      Delete
                    </ContextMenu.Item>
                  )}
                </ContextMenu.Content>
              </ContextMenu.Portal>
            </ContextMenu.Root>
          ) : (
            row
          )}

          {node.type === "folder" && isExpanded && (
            <div role="group">{renderNodes(node.children, depth + 1)}</div>
          )}
        </div>
      );
    });
  }

  return (
    <div role="tree" aria-label={label}>
      {renderNodes(nodes, 0)}
    </div>
  );
}
