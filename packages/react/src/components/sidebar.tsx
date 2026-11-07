import type { ReactNode } from "react";

export interface SidebarProps {
  title?: string;
  children?: ReactNode;
}

export function Sidebar({ title = "Explorer", children }: SidebarProps) {
  return (
    <aside className="flex h-full min-h-0 flex-col bg-fruit-panel">
      <header className="flex h-10 shrink-0 items-center border-b border-fruit-border px-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-fruit-muted">
          {title}
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </aside>
  );
}
