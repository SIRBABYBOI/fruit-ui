export interface EditorTab {
  id: string;
  title: string;
  path?: string;
  modified?: boolean;
  closable?: boolean;
}

export interface ActivityItem {
  id: string;
  label: string;
  icon: string;
}

export interface WorkspaceLayout {
  sidebarVisible: boolean;
  panelVisible: boolean;
  activeActivity: boolean;
}

export type FruitCommandHandler = (...args: unknown[]) => void | Promise<void>;

export interface FruitCommand {
  id: string;
  title: string;
  category?: string;
  keybinding?: string;
  execute: FruitCommandHandler;
}
