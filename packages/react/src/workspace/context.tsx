import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useStore } from 'zustand';
import { createWorkspaceStore, defaultWorkspaceSnapshot, parseWorkspaceSnapshot, serializeWorkspace } from './store';
import type { WorkspaceSnapshot, WorkspaceState, WorkspaceStore } from './store';
import { createCommandRegistry, createKeybindings, shortcutFromEvent } from './commands';
import type { CommandRegistry, Keybinding } from './commands';

interface WorkspaceContextValue { store: WorkspaceStore; commands: CommandRegistry }
const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
export interface WorkspaceProviderProps {
  children: ReactNode;
  initialState?: WorkspaceSnapshot;
  /** Optional browser localStorage key; use a distinct key for each workspace. */
  storageKey?: string;
  keybindings?: Keybinding[];
  onCommandError?: (error: unknown, command: string) => void;
}
const emptyBindings: Keybinding[] = [];
export function WorkspaceProvider({ children, initialState, storageKey, keybindings = emptyBindings, onCommandError }: WorkspaceProviderProps) {
  const [context] = useState<WorkspaceContextValue>(() => {
    let snapshot = initialState ?? defaultWorkspaceSnapshot();
    if (storageKey && typeof window !== 'undefined') {
      try { const saved = window.localStorage.getItem(storageKey); if (saved) snapshot = parseWorkspaceSnapshot(saved) ?? snapshot; } catch { /* Storage may be disabled. */ }
    }
    return { store: createWorkspaceStore(snapshot), commands: createCommandRegistry() };
  });
  const bindings = useMemo(() => createKeybindings(keybindings), [keybindings]);
  useEffect(() => {
    if (!storageKey) return;
    const save = () => { try { window.localStorage.setItem(storageKey, serializeWorkspace(context.store.getState())); } catch { /* The workspace still works without storage. */ } };
    return context.store.subscribe(save);
  }, [context, storageKey]);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.repeat) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])'))) return;
      const shortcut = shortcutFromEvent(event);
      const physicalShortcut = event.altKey ? shortcutFromEvent(event, true) : null;
      const command = (shortcut ? bindings.get(shortcut) : undefined) ?? (physicalShortcut ? bindings.get(physicalShortcut) : undefined);
      if (!command || !context.commands.has(command)) return;
      event.preventDefault();
      void context.commands.execute(command).catch((error) => { if (onCommandError) onCommandError(error, command); else console.error(`Command failed: ${command}`, error); });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [bindings, context, onCommandError]);
  return <WorkspaceContext.Provider value={context}>{children}</WorkspaceContext.Provider>;
}
function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('Workspace hooks require a WorkspaceProvider');
  return context;
}
export function useWorkspace<T>(selector: (state: WorkspaceState) => T): T {
  return useStore(useWorkspaceContext().store, selector);
}
export function useWorkspaceStore(): WorkspaceStore { return useWorkspaceContext().store; }
export function useWorkspaceCommands(): CommandRegistry { return useWorkspaceContext().commands; }
