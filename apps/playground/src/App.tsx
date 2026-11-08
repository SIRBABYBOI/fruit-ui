import { useState } from "react";
import { Files, Search, GitBranch, Settings, FileCode2 } from "lucide-react";

import {
  Workspace,
  WorkspaceLayout,
  ActivityBar,
  Sidebar,
  EditorArea,
  StatusBar,
  useWorkspaceVisibility,
} from "@fruitui/react";

import type { EditorTab } from "@fruitui/core";

const initialTabs: EditorTab[] = [
  {
    id: "main",
    title: "main.zig",
    path: "src/main.zig",
  },
  {
    id: "build",
    title: "build.zig",
    path: "build.zig",
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

export default function App() {
  const [activity, setActivity] = useState("explorer");
  const [tabs, setTabs] = useState<EditorTab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string | null>("main");

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

  function openFile(file: string) {
    const id = file === "main.zig" ? "main" : "build";

    if (!tabs.some((tab) => tab.id === id)) {
      setTabs((current) => [
        ...current,
        {
          id,
          title: file,
        },
      ]);
    }

    setActiveTabId(id);
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
                <div className="p-3 text-xs">
                  <div className="mb-3 font-semibold">PASSIONFRUIT</div>

                  {["main.zig", "build.zig"].map((file) => (
                    <button
                      key={file}
                      type="button"
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-white/5"
                      onClick={() => openFile(file)}
                    >
                      <FileCode2 size={14} />
                      {file}
                    </button>
                  ))}
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
