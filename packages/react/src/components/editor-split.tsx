import type { ReactNode } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";

export interface EditorSplitItem {
  id: string;
  content: ReactNode;
}

export interface EditorSplitProps {
  /**
   * Horizontal places groups side by side.
   * Vertical places them one above the other.
   */
  orientation: "horizontal" | "vertical";

  /**
   * Groups to display. Each ID must be unique within this split.
   */
  groups: EditorSplitItem[];
}

export function EditorSplit({ orientation, groups }: EditorSplitProps) {
  return (
    <Group orientation={orientation}>
      {groups.map((group, index) => (
        <EditorSplitSection
          key={group.id}
          group={group}
          orientation={orientation}
          showSeparator={index > 0}
        />
      ))}
    </Group>
  );
}

interface EditorSplitSectionProps {
  group: EditorSplitItem;
  orientation: "horizontal" | "vertical";
  showSeparator: boolean;
}

function EditorSplitSection({
  group,
  orientation,
  showSeparator,
}: EditorSplitSectionProps) {
  return (
    <>
      {showSeparator && (
        <Separator
          aria-label="Resize editor groups"
          className={
            orientation === "horizontal"
              ? "w-1 bg-fruit-border hover:bg-fruit-accent focus-visible:bg-fruit-accent"
              : "h-1 bg-fruit-border hover:bg-fruit-accent focus-visible:bg-fruit-accent"
          }
        />
      )}

      <Panel id={group.id} minSize="15%">
        {group.content}
      </Panel>
    </>
  );
}
