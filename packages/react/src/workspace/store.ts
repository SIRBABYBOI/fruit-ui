import { createStore, type StoreApi } from 'zustand/vanilla';
import type { EditorTab } from '@fruitui/core';
import type { EditorGroupState } from '../components/use-editor-groups';
import type { WorkspacePanelVisibility } from '../components/workspace-layout';

export type PanelSizes = Record<string, number>;
export interface WorkspaceSnapshot {
  version: 1;
  visibility: WorkspacePanelVisibility;
  orientation: 'horizontal' | 'vertical';
  horizontal: PanelSizes | null;
  vertical: PanelSizes | null;
  groups: EditorGroupState[];
  activeGroupId: string;
}
export interface WorkspaceState extends WorkspaceSnapshot {
  togglePanel(panel: keyof WorkspacePanelVisibility): void;
  setOrientation(orientation: WorkspaceSnapshot['orientation']): void;
  setPanelSizes(axis: 'horizontal' | 'vertical', sizes: PanelSizes): void;
  setActiveGroup(id: string): void;
  addGroup(id: string): void;
  removeGroup(id: string): void;
  openTab(groupId: string, tab: EditorTab): void;
  setActiveTab(groupId: string, tabId: string): void;
  closeTab(groupId: string, tabId: string): void;
  reorderTabs(groupId: string, tabs: EditorTab[]): void;
  renameTabEverywhere(id: string, title: string): void;
  closeTabsEverywhere(ids: string[]): void;
}
export type WorkspaceStore = StoreApi<WorkspaceState>;
export const defaultWorkspaceSnapshot = (): WorkspaceSnapshot => ({
  version: 1,
  visibility: { sidebar: true, secondarySidebar: true, bottomPanel: true },
  orientation: 'horizontal', horizontal: null, vertical: null,
  groups: [{ id: 'main', tabs: [], activeTabId: null }], activeGroupId: 'main',
});
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const sizesValid = (value: unknown): value is PanelSizes | null => value === null || (record(value) && Object.values(value).every((n) => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 100));
const tabValid = (value: unknown): value is EditorTab => record(value) && typeof value.id === 'string' && value.id.length > 0 && typeof value.title === 'string' && (value.path === undefined || typeof value.path === 'string') && (value.modified === undefined || typeof value.modified === 'boolean') && (value.closable === undefined || typeof value.closable === 'boolean');

export function parseWorkspaceSnapshot(input: string): WorkspaceSnapshot | null {
  try {
    const value: unknown = JSON.parse(input);
    if (!record(value) || value.version !== 1 || !record(value.visibility)) return null;
    const v = value.visibility;
    if (typeof v.sidebar !== 'boolean' || typeof v.secondarySidebar !== 'boolean' || typeof v.bottomPanel !== 'boolean' || !['horizontal', 'vertical'].includes(value.orientation as string) || !sizesValid(value.horizontal) || !sizesValid(value.vertical) || !Array.isArray(value.groups) || value.groups.length === 0 || typeof value.activeGroupId !== 'string') return null;
    const groups: EditorGroupState[] = [];
    for (const g of value.groups) {
      if (!record(g) || typeof g.id !== 'string' || !g.id || !Array.isArray(g.tabs) || !g.tabs.every(tabValid) || new Set(g.tabs.map((t: EditorTab) => t.id)).size !== g.tabs.length || !(g.activeTabId === null || (typeof g.activeTabId === 'string' && g.tabs.some((t: EditorTab) => t.id === g.activeTabId)))) return null;
      groups.push({ id: g.id, tabs: g.tabs.map((t: EditorTab) => ({ id: t.id, title: t.title, ...(t.path !== undefined && { path: t.path }), ...(t.modified !== undefined && { modified: t.modified }), ...(t.closable !== undefined && { closable: t.closable }) })), activeTabId: g.activeTabId as string | null });
    }
    if (new Set(groups.map((g) => g.id)).size !== groups.length || !groups.some((g) => g.id === value.activeGroupId)) return null;
    return { version: 1, visibility: { sidebar: v.sidebar, secondarySidebar: v.secondarySidebar, bottomPanel: v.bottomPanel }, orientation: value.orientation as WorkspaceSnapshot['orientation'], horizontal: value.horizontal, vertical: value.vertical, groups, activeGroupId: value.activeGroupId };
  } catch { return null; }
}
export function serializeWorkspace(state: WorkspaceSnapshot): string {
  const { version, visibility, orientation, horizontal, vertical, groups, activeGroupId } = state;
  return JSON.stringify({ version, visibility, orientation, horizontal, vertical, groups, activeGroupId });
}
export function createWorkspaceStore(initial: WorkspaceSnapshot = defaultWorkspaceSnapshot()): WorkspaceStore {
  const valid = parseWorkspaceSnapshot(JSON.stringify(initial));
  if (!valid) throw new Error('Invalid initial workspace snapshot');
  return createStore<WorkspaceState>()((set) => ({
    ...valid,
    togglePanel: (panel) => set((s) => ({ visibility: { ...s.visibility, [panel]: !s.visibility[panel] } })),
    setOrientation: (orientation) => set({ orientation }),
    setPanelSizes: (axis, sizes) => { if (sizesValid(sizes)) set({ [axis]: { ...sizes } }); },
    setActiveGroup: (id) => set((s) => s.groups.some((g) => g.id === id) ? { activeGroupId: id } : {}),
    addGroup: (id) => set((s) => !id || s.groups.some((g) => g.id === id) ? {} : { groups: [...s.groups, { id, tabs: [], activeTabId: null }], activeGroupId: id }),
    removeGroup: (id) => set((s) => { const groups = s.groups.filter((g) => g.id !== id); return groups.length === 0 || groups.length === s.groups.length ? {} : { groups, activeGroupId: s.activeGroupId === id ? groups[0]!.id : s.activeGroupId }; }),
    openTab: (groupId, tab) => set((s) => !tabValid(tab) || !s.groups.some((g) => g.id === groupId) ? {} : { activeGroupId: groupId, groups: s.groups.map((g) => g.id !== groupId ? g : { ...g, tabs: g.tabs.some((t) => t.id === tab.id) ? g.tabs : [...g.tabs, { ...tab }], activeTabId: tab.id }) }),
    setActiveTab: (groupId, tabId) => set((s) => !s.groups.some((g) => g.id === groupId && g.tabs.some((t) => t.id === tabId)) ? {} : { activeGroupId: groupId, groups: s.groups.map((g) => g.id === groupId ? { ...g, activeTabId: tabId } : g) }),
    closeTab: (groupId, tabId) => set((s) => ({ groups: s.groups.map((g) => { if (g.id !== groupId) return g; const tabs = g.tabs.filter((t) => t.id !== tabId); return { ...g, tabs, activeTabId: g.activeTabId === tabId ? tabs[0]?.id ?? null : g.activeTabId }; }) })),
    reorderTabs: (groupId, tabs) => set((s) => ({ groups: s.groups.map((g) => { if (g.id !== groupId) return g; const ids = tabs.map((t) => t.id); if (ids.length !== g.tabs.length || new Set(ids).size !== ids.length || ids.some((id) => !g.tabs.some((t) => t.id === id))) return g; return { ...g, tabs: ids.map((id) => g.tabs.find((t) => t.id === id)!) }; }) })),
    renameTabEverywhere: (id, title) => set((s) => ({ groups: s.groups.map((g) => ({ ...g, tabs: g.tabs.map((t) => t.id === id ? { ...t, title } : t) })) })),
    closeTabsEverywhere: (ids) => set((s) => ({ groups: s.groups.map((g) => { const tabs = g.tabs.filter((t) => !ids.includes(t.id)); return { ...g, tabs, activeTabId: g.activeTabId && ids.includes(g.activeTabId) ? tabs[0]?.id ?? null : g.activeTabId }; }) })),
  }));
}
