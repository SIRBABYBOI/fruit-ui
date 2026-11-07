import type { ReactNode } from "react";

export interface StatusBarProps {
  left?: ReactNode;
  right?: ReactNode;
}

export function StatusBar({ left, right }: StatusBarProps) {
  return (
    <footer className="flex h-6.5 shrink-0 items-center justify-between border-t border-fruit-border bg-fruit-panel px-3 text-[11px] text-fruit-muted">
      <div className="flex items-center gap-3">{left}</div>
      <div className="flex items-center gap-3">{right}</div>
    </footer>
  );
}
