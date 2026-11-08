import type { ReactNode } from "react";

export interface ActivityBarItem {
  id: string;
  label: string;
  icon: ReactNode;
}

export interface ActivityBarProps {
  items: ActivityBarItem[];
  activeId: string;
  onActiveChange: (id: string) => void;
}

export function ActivityBar({
  items,
  activeId,
  onActiveChange,
}: ActivityBarProps) {
  return (
    <nav
      aria-label="Workspace activities"
      className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-fruit-border bg-fruit-panel py-2"
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          title={item.label}
          aria-label={item.label}
          aria-current={activeId === item.id ? "page" : undefined}
          onClick={() => onActiveChange(item.id)}
          className={`flex h-10 w-10 items-center justify-center rounded-md transition-colors ${activeId === item.id ? "bg-fruit-accent/10 text-fruit-accent" : "text-fruit-muted hover:bg-white/5 hover:text-fruit-text"}`}
        >
          {item.icon}
        </button>
      ))}
    </nav>
  );
}
