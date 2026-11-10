import type { EditorTab } from "@fruitui/core";
import { type ReactNode } from "react";
import { EditorArea } from "./editor-area";

export interface EditorGroupProps {
  /**
   * Identifies this group when the application has more than one.
   */
  id: string;

  /**
   * Tabs and active tab are controlled by the application.
   */
  tabs: EditorTab[];
  activeTabId: string | null;

  onActiveTabChange: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onTabReorder?: (tabs: EditorTab[]) => void;

  /**
   * Content displayed for the active tab.
   */
  children?: ReactNode;

  /**
   * Content displayed when there is no active tab.
   */
  emptyState?: ReactNode;
}

export function EditorGroup({
  id,
  tabs,
  activeTabId,
  onActiveTabChange,
  onTabClose,
  onTabReorder,
  children,
  emptyState,
}: EditorGroupProps) {
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <div data-editor-group={id} className="h-full min-h-0 min-w-0">
      <EditorArea
        tabs={tabs}
        activeTabId={activeTab?.id ?? null}
        onActiveTabChange={onActiveTabChange}
        onTabClose={onTabClose}
        onTabReorder={onTabReorder}
      >
        {activeTab
          ? children
          : (emptyState ?? (
              <div className="flex h-full items-center justify-center text-sm text-fruit-muted">
                No editor open
              </div>
            ))}
      </EditorArea>
    </div>
  );
}
