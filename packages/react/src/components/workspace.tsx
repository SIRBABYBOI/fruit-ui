import type { HTMLAttributes } from "react";

export interface WorkspaceProps extends HTMLAttributes<HTMLDivElement> {}

export function Workspace({
  children,
  className = "",
  ...props
}: WorkspaceProps) {
  return (
    <div className={`fruitui flex flex-col ${className}`} {...props}>
      {children}
    </div>
  );
}
