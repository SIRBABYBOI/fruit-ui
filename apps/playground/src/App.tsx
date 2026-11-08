import { useState } from "react";
import { Files, Search, GitBranch, Settings, FileCode2 } from "lucide-react";

import { Group, Panel, Separator } from "react-resizable-panels";

import {
  Workspace,
  ActivityBar,
  Sidebar,
  EditorArea,
  StatusBar,
} from "@fruitui/react";

import type { EditorTab } from "@fruitui/core";
import { native } from "@fruitui/zig-bridge/webview";

native.invoke("test", {}).catch((error) => {
  console.log(error.message);
});

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

  function closeTab(id: string) {
    const remaining = tabs.filter((tab) => tab.id !== id);

    setTabs(remaining);

    if (activeTabId === id) {
      setActiveTabId(remaining.length > 0 ? remaining[0].id : null);
    }
  }

  return (
    <Workspace>
      <div className="flex min-h-0 flex-1">
        <ActivityBar
          items={activities}
          activeId={activity}
          onActiveChange={setActivity}
        />

        <div className="min-w-0 flex-1">
          <Group orientation="horizontal">
            <Panel defaultSize="23%" minSize="12%" maxSize="45%">
              <Sidebar title={activity}>
                {activity === "explorer" && (
                  <div className="p-3 text-xs">
                    <div className="mb-3 font-semibold">PASSIONFRUIT</div>

                    {["main.zig", "build.zig"].map((file) => (
                      <button
                        key={file}
                        type="button"
                        className="flex w-full items-center
                                     gap-2 rounded px-2 py-1.5
                                     text-left hover:bg-white/5"
                        onClick={() => {
                          const id = file === "main.zig" ? "main" : "build";

                          if (!tabs.some((tab) => tab.id === id)) {
                            setTabs((previous) => [
                              ...previous,
                              {
                                id,
                                title: file,
                              },
                            ]);
                          }

                          setActiveTabId(id);
                        }}
                      >
                        <FileCode2 size={14} />
                        {file}
                      </button>
                    ))}
                  </div>
                )}
              </Sidebar>
            </Panel>

            <Separator
              className="w-1 cursor-col-resize
                         bg-fruit-border
                         hover:bg-fruit-accent"
            />

            <Panel minSize="30%">
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
                  <div
                    className="flex h-full items-center
                               justify-center text-sm
                               text-fruit-muted"
                  >
                    No editor open
                  </div>
                )}
              </EditorArea>
            </Panel>
          </Group>
        </div>
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
            <span>FruitUI v0.1.0</span>
          </>
        }
      />
    </Workspace>
  );
}
