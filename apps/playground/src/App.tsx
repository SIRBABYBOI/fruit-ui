import { useState } from "react";
import { Files, Search, GitBranch, Settings } from "lucide-react";

import {
  Workspace,
  WorkspaceLayout,
  ActivityBar,
  Sidebar,
  EditorGroup,
  EditorSplit,
  StatusBar,
  FileTree,
  useWorkspaceVisibility,
  useEditorGroups,
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
    modified: true,
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

  const {
    groups,
    activeGroupId,
    setActiveGroup,
    addGroup,
    removeGroup,
    openTab,
    setActiveTab,
    closeTab,
    reorderTabs,
    renameTabEverywhere,
    closeTabsEverywhere,
  } = useEditorGroups({
    groups: [
      {
        id: "main",
        tabs: initialTabs,
        activeTabId: "src/main.zig",
      },
    ],
    activeGroupId: "main",
  });

  const [splitOrientation, setSplitOrientation] = useState<
    "horizontal" | "vertical"
  >("horizontal");

  const [fileTree, setFileTree] = useState<FileTreeNode[]>(initialFileTree);
  const [expandedIds, setExpandedIds] = useState<string[]>(["src"]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    "src/main.zig",
  );

  const { visibility, togglePanel } = useWorkspaceVisibility(
    "fruitui-playground-visibility",
  );

  function openFile(node: FileTreeNode) {
    if (node.type !== "file") {
      return;
    }

    setSelectedFileId(node.id);

    openTab(activeGroupId, {
      id: node.id,
      title: node.name,
    });
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

    // These are mock identifiers, not filesystem paths.
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

    if (node.type === "file") {
      renameTabEverywhere(node.id, name);
    }
  }

  function remove(node: FileTreeNode) {
    const confirmed = window.confirm(
      `Delete "${node.name}" from the mock tree?`,
    );

    if (!confirmed) {
      return;
    }

    const removedIds = collectIds(node);

    setFileTree((current) => removeNode(current, node.id));

    setExpandedIds((current) =>
      current.filter((id) => !removedIds.includes(id)),
    );

    closeTabsEverywhere(removedIds);

    if (selectedFileId && removedIds.includes(selectedFileId)) {
      setSelectedFileId(null);
    }
  }

  function refresh(node: FileTreeNode) {
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

        <button
          type="button"
          onClick={() => {
            setSplitOrientation((current) =>
              current === "horizontal" ? "vertical" : "horizontal",
            );
          }}
          className="rounded px-2 py-1 hover:bg-white/10"
        >
          Change editor split
        </button>

        <button
          type="button"
          onClick={() => addGroup(crypto.randomUUID())}
          className="rounded px-2 py-1 hover:bg-white/10"
        >
          Add editor group
        </button>

        <button
          type="button"
          disabled={groups.length <= 1}
          onClick={() => {
            const group = groups.find((item) => item.id === activeGroupId);

            if (
              group &&
              (group.tabs.length === 0 ||
                window.confirm("Close this editor group and its tabs?"))
            ) {
              removeGroup(group.id);
            }
          }}
          className="rounded px-2 py-1 hover:bg-white/10 disabled:opacity-40"
        >
          Close active group
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
            <EditorSplit
              orientation={splitOrientation}
              groups={groups.map((group) => ({
                id: group.id,
                content: (
                  <div
                    className="h-full min-h-0"
                    onPointerDownCapture={() => setActiveGroup(group.id)}
                    onFocusCapture={() => setActiveGroup(group.id)}
                  >
                    <EditorGroup
                      id={group.id}
                      tabs={group.tabs}
                      activeTabId={group.activeTabId}
                      onActiveTabChange={(tabId) => {
                        setActiveTab(group.id, tabId);
                      }}
                      onTabClose={(tabId) => {
                        closeTab(group.id, tabId);
                      }}
                      onTabReorder={(tabs) => {
                        reorderTabs(group.id, tabs);
                      }}
                      emptyState={
                        <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-fruit-muted">
                          <p>No editor open</p>
                          <p>Select a file from the explorer to get started.</p>
                        </div>
                      }
                    >
                      <div className="p-6 font-mono text-sm">
                        <span className="text-fruit-muted">
                          //{" "}
                          {
                            group.tabs.find(
                              (tab) => tab.id === group.activeTabId,
                            )?.title
                          }
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
                    </EditorGroup>
                  </div>
                ),
              }))}
            />
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
