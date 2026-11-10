/// <reference types="bun" />
import { describe, expect, test } from 'bun:test';
import { createWorkspaceStore, defaultWorkspaceSnapshot, parseWorkspaceSnapshot, serializeWorkspace } from './store';
import { createCommandRegistry, createKeybindings, normalizeShortcut, shortcutFromEvent } from './commands';

describe('workspace state', () => {
  test('keeps editor groups independent and restores a snapshot', () => {
    const store = createWorkspaceStore();
    store.getState().openTab('main', { id: 'a', title: 'A', modified: true });
    store.getState().addGroup('other');
    store.getState().openTab('other', { id: 'a', title: 'A' });
    store.getState().openTab('other', { id: 'b', title: 'B' });
    store.getState().closeTab('other', 'a');
    store.getState().togglePanel('sidebar');
    store.getState().setPanelSizes('horizontal', { center: 80, sidebar: 20 });
    const saved = parseWorkspaceSnapshot(serializeWorkspace(store.getState()));
    expect(saved?.visibility.sidebar).toBe(false);
    expect(saved?.horizontal).toEqual({ center: 80, sidebar: 20 });
    expect(saved?.groups[0]?.tabs[0]?.modified).toBe(true);
    expect(saved?.groups[1]?.tabs.map((t) => t.id)).toEqual(['b']);
    expect(saved?.activeGroupId).toBe('other');
    expect(saved).not.toBeNull();
    expect(createWorkspaceStore(saved!).getState().groups).toEqual(saved!.groups);
  });
  test('rejects corrupt, unsupported, and inconsistent snapshots', () => {
    expect(parseWorkspaceSnapshot('{')).toBeNull();
    expect(parseWorkspaceSnapshot(JSON.stringify({ ...defaultWorkspaceSnapshot(), version: 2 }))).toBeNull();
    expect(parseWorkspaceSnapshot(JSON.stringify({ ...defaultWorkspaceSnapshot(), activeGroupId: 'missing' }))).toBeNull();
    expect(parseWorkspaceSnapshot(JSON.stringify({ ...defaultWorkspaceSnapshot(), horizontal: { x: -1 } }))).toBeNull();
  });
  test('does not allow removing the final group or invalid tab order', () => {
    const store = createWorkspaceStore();
    store.getState().removeGroup('main');
    store.getState().openTab('main', { id: 'a', title: 'A' });
    store.getState().reorderTabs('main', [{ id: 'b', title: 'B' }]);
    expect(store.getState().groups[0]?.tabs).toEqual([{ id: 'a', title: 'A' }]);
  });
});
describe('commands and shortcuts', () => {
  test('registers, executes and unregisters commands', async () => {
    const registry = createCommandRegistry();
    let calls = 0;
    const unregister = registry.register('toggle', () => { calls++; });
    expect(() => registry.register('toggle', () => {})).toThrow();
    expect(await registry.execute('toggle')).toBe(true);
    unregister();
    expect(await registry.execute('toggle')).toBe(false);
    expect(calls).toBe(1);
  });
  test('normalizes modifiers and rejects conflicting shortcuts', () => {
    expect(normalizeShortcut('Shift+Control+K')).toBe('ctrl+shift+k');
    expect(shortcutFromEvent({ key: 'K', ctrlKey: true, shiftKey: true, altKey: false, metaKey: false })).toBe('ctrl+shift+k');
    expect(() => createKeybindings([{ key: 'ctrl+k', command: 'one' }, { key: 'Control+K', command: 'two' }])).toThrow();
  });
  test('supports Option-generated characters through the physical letter fallback', () => {
    const optionB = { key: '∫', code: 'KeyB', ctrlKey: false, shiftKey: false, altKey: true, metaKey: false };
    expect(shortcutFromEvent(optionB)).toBe('alt+∫');
    expect(shortcutFromEvent(optionB, true)).toBe('alt+b');
    const optionJ = { ...optionB, key: '∆', code: 'KeyJ' };
    expect(shortcutFromEvent(optionJ, true)).toBe('alt+j');
  });
});
