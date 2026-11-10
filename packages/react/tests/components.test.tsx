import { beforeEach, afterEach, describe, expect, test } from 'bun:test';
import { GlobalRegistrator } from '@happy-dom/global-registrator';
GlobalRegistrator.register({ url: 'http://localhost' });
const React = await import('react');
const { render, fireEvent, cleanup, screen, act } = await import('@testing-library/react');
const { FileTree } = await import('../src/components/file-tree');
const { WorkspaceProvider, useWorkspace } = await import('../src/workspace/context');
const { defaultWorkspaceSnapshot } = await import('../src/workspace/store');
const { WorkspaceLayout } = await import('../src/components/workspace-layout');

afterEach(() => { cleanup(); localStorage.clear(); });
beforeEach(() => localStorage.clear());

describe('file tree', () => {
  test('expands folders and navigates and selects a file with the keyboard', () => {
    const nodes = [{ type: 'folder' as const, id: 'src', name: 'src', children: [{ type: 'file' as const, id: 'src/a', name: 'a.ts' }] }];
    let selected = '';
    function Demo() {
      const [expanded, setExpanded] = React.useState<string[]>([]);
      const [id, setId] = React.useState<string | null>(null);
      return <FileTree nodes={nodes} expandedIds={expanded} onExpandedChange={setExpanded} selectedId={id} onSelect={(node) => { selected = node.id; setId(node.id); }} />;
    }
    render(<Demo />);
    const folder = screen.getByRole('treeitem', { name: 'src' });
    expect(folder.getAttribute('aria-expanded')).toBe('false');
    act(() => folder.focus());
    fireEvent.keyDown(folder, { key: 'ArrowRight' });
    expect(folder.getAttribute('aria-expanded')).toBe('true');
    fireEvent.keyDown(folder, { key: 'ArrowRight' });
    const file = screen.getByRole('treeitem', { name: 'a.ts' });
    expect(document.activeElement).toBe(file);
    fireEvent.keyDown(file, { key: 'Enter' });
    expect(selected).toBe('src/a');
    expect(file.getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(file, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(folder);
  });
  test('context menu passes the selected node to the operation callback', () => {
    let renamed = '';
    render(<FileTree nodes={[{ type: 'file', id: 'a', name: 'a.ts' }]} expandedIds={[]} onExpandedChange={() => {}} selectedId={null} onSelect={() => {}} onRename={(node) => { renamed = node.id; }} />);
    fireEvent.contextMenu(screen.getByText('a.ts'), { button: 2, clientX: 10, clientY: 10 });
    fireEvent.click(screen.getByRole('menuitem', { name: 'Rename' }));
    expect(renamed).toBe('a');
  });
  test('folder operations call the provided handlers', () => {
    const calls: string[] = [];
    const node = { type: 'folder' as const, id: 'folder', name: 'folder', children: [] };
    render(<FileTree nodes={[node]} expandedIds={[]} onExpandedChange={() => {}} selectedId={null} onSelect={() => {}} onCreateFile={(n) => calls.push(`file:${n.id}`)} onCreateFolder={(n) => calls.push(`folder:${n.id}`)} onRefresh={(n) => calls.push(`refresh:${n.id}`)} onDelete={(n) => calls.push(`delete:${n.id}`)} />);
    for (const action of ['New file', 'New folder', 'Refresh', 'Delete']) {
      fireEvent.contextMenu(screen.getByText('folder'), { button: 2, clientX: 10, clientY: 10 });
      fireEvent.click(screen.getByRole('menuitem', { name: action }));
    }
    expect(calls).toEqual(['file:folder', 'folder:folder', 'refresh:folder', 'delete:folder']);
  });
});
describe('workspace provider', () => {
  test('persists visibility and editor groups across remounts', () => {
    function Demo() {
      const { visibility, togglePanel, addGroup, groups } = useWorkspace((state) => state);
      return <><button onClick={() => togglePanel('sidebar')}>Sidebar {String(visibility.sidebar)}</button><button onClick={() => addGroup('second')}>Add</button><span>Groups {groups.length}</span></>;
    }
    const mount = () => render(<WorkspaceProvider storageKey="test-workspace" initialState={defaultWorkspaceSnapshot()}><Demo /></WorkspaceProvider>);
    const first = mount();
    fireEvent.click(screen.getByRole('button', { name: 'Sidebar true' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    first.unmount();
    mount();
    expect(screen.getByRole('button', { name: 'Sidebar false' })).toBeTruthy();
    expect(screen.getByText('Groups 2')).toBeTruthy();
  });
  test('renders visible panels and removes hidden panels', () => {
    const props = { editor: <div>Editor</div>, sidebar: <div>Explorer</div>, bottomPanel: <div>Terminal</div> };
    const view = render(<WorkspaceLayout {...props} visibility={{ sidebar: true, bottomPanel: true }} />);
    expect(screen.getByText('Explorer')).toBeTruthy();
    view.rerender(<WorkspaceLayout {...props} visibility={{ sidebar: false, bottomPanel: false }} />);
    expect(screen.queryByText('Explorer')).toBeNull();
    expect(screen.queryByText('Terminal')).toBeNull();
    expect(screen.getByText('Editor')).toBeTruthy();
  });
});
