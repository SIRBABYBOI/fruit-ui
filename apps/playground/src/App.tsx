import { useState } from "react";
import { Files, Search, GitBranch, Settings } from "lucide-react";

import {
  Workspace,
  WorkspaceLayout,
  ActivityBar,
  Sidebar,
  EditorArea,
  StatusBar,
  FileTree,
  useWorkspaceVisibility,
} from "@fruitui/react";

import type { EditorTab, FileTreeNode } from "@fruitui/core";

const initialTabs: EditorTab[] = [
  {
    id: "src/main.zig",
    title: "main.zig",
  },
  {
    id: "build.zig",
    title: "build.zig",
  },
];

const initialFileTree: FileTreeNode[] = [
  {
    type: "folder",
    id: "src",
    name: "src",
    children: [
      {
        type: "file",
        id: "src/main.zig",
        name: "main.zig",
      },
      {
        type: "folder",
        id: "src/components",
        name: "components",
        children: [
          {
            type: "file",
            id: "src/components/sidebar.zig",
            name: "sidebar.zig",
          },
        ],
      },
    ],
  },
  {
    type: "file",
    id: "build.zig",
    name: "build.zig",
  },
  {
    type: "file",
    id: "README.md",
    name: "README.md",
  },
];

const activities = [
  {
    id: "explorer",
    label: "Explorer",
    icon: <Files size={20} />,
  },
  {
    id: "search",
    label: "Search",
    icon: <Search size={20} />,
  },
  {
    id: "source-control",
    label: "Source Control",
    icon: <GitBranch size={20} />,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings size={20} />,
  },
];

function addChild(
  nodes: FileTreeNode[],
  folderId: string,
  child: FileTreeNode,
): FileTreeNode[] {
  return nodes.map((node) => {
    if (node.type !== "folder") {
      return node;
    }

    if (node.id === folderId) {
      return {
        ...node,
        children: [...node.children, child],
      };
    }

    return {
      ...node,
      children: addChild(node.children, folderId, child),
    };
  });
}

function renameNode(
  nodes: FileTreeNode[],
  id: string,
  name: string,
): FileTreeNode[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return { ...node, name };
    }

    if (node.type === "folder") {
      return {
        ...node,
        children: renameNode(node.children, id, name),
      };
    }

    return node;
  });
}

function removeNode(nodes: FileTreeNode[], id: string): FileTreeNode[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) => {
      if (node.type === "folder") {
        return {
          ...node,
          children: removeNode(node.children, id),
        };
      }

      return node;
    });
}

function collectIds(node: FileTreeNode): string[] {
  if (node.type === "file") {
    return [node.id];
  }

  return [node.id, ...node.children.flatMap(collectIds)];
}

export default function App() {
  const [activity, setActivity] = useState("explorer");
  const [tabs, setTabs] = useState<EditorTab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string | null>("src/main.zig");

  const [fileTree, setFileTree] = useState<FileTreeNode[]>(initialFileTree);
  const [expandedIds, setExpandedIds] = useState<string[]>(["src"]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    "src/main.zig",
  );

  const { visibility, togglePanel } = useWorkspaceVisibility(
    "fruitui-playground-visibility",
  );

  function closeTab(id: string) {
    const remaining = tabs.filter((tab) => tab.id !== id);

    setTabs(remaining);

    if (activeTabId === id) {
      setActiveTabId(remaining[0]?.id ?? null);
    }
  }

  function openFile(node: FileTreeNode) {
    if (node.type !== "file") {
      return;
    }

    setSelectedFileId(node.id);

    if (!tabs.some((tab) => tab.id === node.id)) {
      setTabs((current) => [
        ...current,
        {
          id: node.id,
          title: node.name,
        },
      ]);
    }

    setActiveTabId(node.id);
  }

  function createNode(folder: FileTreeNode, type: "file" | "folder") {
    if (folder.type !== "folder") {
      return;
    }

    const name = window
      .prompt(type === "file" ? "File name:" : "Folder name:")
      ?.trim();

    if (!name) {
      return;
    }

    // Mock IDs are stable identifiers, not filesystem paths.
    const id = crypto.randomUUID();

    const child: FileTreeNode =
      type === "file"
        ? { type: "file", id, name }
        : { type: "folder", id, name, children: [] };

    setFileTree((current) => addChild(current, folder.id, child));

    setExpandedIds((current) =>
      current.includes(folder.id) ? current : [...current, folder.id],
    );
  }

  function rename(node: FileTreeNode) {
    const name = window.prompt("New name:", node.name)?.trim();

    if (!name) {
      return;
    }

    setFileTree((current) => renameNode(current, node.id, name));

    // Update an open tab if the renamed node is a file.
    if (node.type === "file") {
      setTabs((current) =>
        current.map((tab) =>
          tab.id === node.id ? { ...tab, title: name } : tab,
        ),
      );
    }
  }

  function remove(node: FileTreeNode) {
    const confirmed = window.confirm(
      `Delete "${node.name}" from the mock tree?`,
    );

    if (!confirmed) {
      return;
    }

    const removedIds = new Set(collectIds(node));
    const remainingTabs = tabs.filter((tab) => !removedIds.has(tab.id));

    setFileTree((current) => removeNode(current, node.id));
    setExpandedIds((current) => current.filter((id) => !removedIds.has(id)));
    setTabs(remainingTabs);

    if (activeTabId && removedIds.has(activeTabId)) {
      setActiveTabId(remainingTabs[0]?.id ?? null);
    }

    if (selectedFileId && removedIds.has(selectedFileId)) {
      setSelectedFileId(null);
    }
  }

  function refresh(node: FileTreeNode) {
    // A real app could ask its host to reload this folder here.
    console.log("Refresh requested:", node);
  }

  return (
    <Workspace>
      <div className="flex shrink-0 items-center gap-2 border-b border-fruit-border bg-fruit-panel p-2 text-xs">
        <button
          type="button"
          aria-pressed={visibility.sidebar}
          onClick={() => togglePanel("sidebar")}
          className="rounded px-2 py-1 hover:bg-white/10"
        >
          Toggle sidebar
        </button>

        <button
          type="button"
          aria-pressed={visibility.bottomPanel}
          onClick={() => togglePanel("bottomPanel")}
          className="rounded px-2 py-1 hover:bg-white/10"
        >
          Toggle bottom panel
        </button>

        <button
          type="button"
          aria-pressed={visibility.secondarySidebar}
          onClick={() => togglePanel("secondarySidebar")}
          className="rounded px-2 py-1 hover:bg-white/10"
        >
          Toggle secondary sidebar
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        <ActivityBar
          items={activities}
          activeId={activity}
          onActiveChange={setActivity}
        />

        <WorkspaceLayout
          storageKey="fruitui-playground-layout"
          visibility={visibility}
          onHorizontalLayoutChange={(layout) => {
            console.log("Horizontal layout:", layout);
          }}
          onVerticalLayoutChange={(layout) => {
            console.log("Vertical layout:", layout);
          }}
          sidebar={
            <Sidebar title={activity}>
              {activity === "explorer" && (
                <div className="p-3">
                  <div className="mb-3 text-xs font-semibold">PASSIONFRUIT</div>

                  <FileTree
                    nodes={fileTree}
                    expandedIds={expandedIds}
                    onExpandedChange={setExpandedIds}
                    selectedId={selectedFileId}
                    onSelect={openFile}
                    onCreateFile={(folder) => createNode(folder, "file")}
                    onCreateFolder={(folder) => createNode(folder, "folder")}
                    onRename={rename}
                    onDelete={remove}
                    onRefresh={refresh}
                    label="Project files"
                  />
                </div>
              )}
            </Sidebar>
          }
          editor={
            <EditorArea
              tabs={tabs}
              activeTabId={activeTabId}
              onActiveTabChange={setActiveTabId}
              onTabClose={closeTab}
            >
              {activeTabId ? (
                <div className="p-6 font-mono text-sm">
                  <span className="text-fruit-muted">
                    // {tabs.find((tab) => tab.id === activeTabId)?.title}
                  </span>

                  <pre className="mt-4 text-fruit-text">
                    {`const std = @import("std");

pub fn main() void {
    std.debug.print(
        "Hello from FruitUI!\\n",
        .{},
    );
}`}
                  </pre>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-fruit-muted">
                  No editor open
                </div>
              )}
            </EditorArea>
          }
          bottomPanel={
            <div className="h-full bg-fruit-panel p-3 text-xs">
              Bottom panel
            </div>
          }
          secondarySidebar={
            <Sidebar title="Inspector">
              <div className="p-3 text-xs">Secondary sidebar content</div>
            </Sidebar>
          }
        />
      </div>

      <StatusBar
        left={
          <>
            <GitBranch size={12} />
            <span>main</span>
          </>
        }
        right={
          <>
            <span>Zig</span>
            <span>UTF-8</span>
            <span>FruitUI playground</span>
          </>
        }
      />
    </Workspace>
  );
}
