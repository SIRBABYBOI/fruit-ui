import type { EditorTab } from "@fruitui/core";
import type { ReactNode } from "react";
import { X } from "lucide-react";

export interface EditorAreaProps {
  tabs: EditorTab[];
  activeTabId: string | null;
  onActiveTabChange: (id: string) => void;
  onTabClose?: (id: string) => void;
  children?: ReactNode;
}

export function EditorArea({
  tabs,
  activeTabId,
  onActiveTabChange,
  onTabClose,
  children,
}: EditorAreaProps) {
  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col bg-fruit-bg">
      <div
        role="tablist"
        aria-label="Open editors"
        className="flex h-10 shrink-0 overflow-x-auto border-b border-fruit-border bg-fruit-panel"
      >
        {tabs.map((tab) => {
          const active = tab.id === activeTabId;

          return (
            <div
              key={tab.id}
              className={`
                    flex shrink-0 items-center border-r border-fruit-border ${active ? "bg-fruit-bg text-fruit-text" : "text-fruit-muted"}`}
            >
              <button
                type="button"
                role="tab"
                id={`fruit-tab-${tab.id}`}
                aria-selected={active}
                onClick={() => onActiveTabChange(tab.id)}
                className="flex h-full items-center gap-2 px-4 text-xs"
              >
                {tab.title}
                {tab.modified && (
                  <span
                    aria-label="Unsaved changes"
                    className="h-1.5 w-1.5 rounded-full bg-fruit-accent"
                  />
                )}
              </button>

              {tab.closable !== false && (
                <button
                  type="button"
                  aria-label={`Close ${tab.title}`}
                  onClick={() => onTabClose?.(tab.id)}
                  className="mr-2 rounded p-1 hover:bg-white/10"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </section>
  );
}
