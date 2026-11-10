# @fruitui/react

React components for an editor-style workspace: `Workspace`, `ActivityBar`, `Sidebar`, `EditorArea`, and `StatusBar`.

Install the alpha package with React 19 and React DOM 19:

```sh
npm install @fruitui/react@alpha react react-dom
```

```tsx
import { Workspace, Sidebar, StatusBar } from "@fruitui/react";
import "@fruitui/react/styles.css";

export function App() {
  return (
    <Workspace>
      <Sidebar title="Explorer">Your files go here</Sidebar>
      <StatusBar left="Ready" />
    </Workspace>
  );
}
```

The components provide the workspace structure; your application supplies and styles its own content. The stylesheet includes Tailwind's base styles and applies global page and button styles. See the repository's playground for an example with activities and editor tabs.

## Workspace state and commands

`WorkspaceProvider` gives each workspace its own Zustand store and command registry. `useWorkspace` selects state and actions, and `useWorkspaceCommands` returns the registry. Pass a stable `storageKey` to save and restore the versioned snapshot in browser localStorage. Invalid or unsupported snapshots fall back to the initial state. For custom storage, use `serializeWorkspace` and `parseWorkspaceSnapshot` with `createWorkspaceStore`.

Register a command and return its cleanup function from an effect:

```tsx
const commands = useWorkspaceCommands();
const togglePanel = useWorkspace((state) => state.togglePanel);

useEffect(() => {
  return commands.register("sidebar.toggle", () => togglePanel("sidebar"));
}, [commands, togglePanel]);
```

Pass `keybindings={[{ key: "Alt+b", command: "sidebar.toggle" }]}` to the provider to bind a shortcut. Duplicate commands or shortcuts throw an error. Shortcuts don't run while typing in inputs or editable content. Registration and execution do not provide undo or confirmation; commands own that behavior.

For Alt/Option shortcuts, matching first uses the character reported by the keyboard; if it doesn't match, letter keys also fall back to their physical key code. This lets shortcuts such as Option+B work on macOS, where Option may produce a symbol instead of a letter.

`WorkspaceLayout` accepts `defaultHorizontalLayout` and `defaultVerticalLayout` for the store's saved sizes and reports completed changes through its layout callbacks. When using the workspace store, avoid also supplying the layout's older `storageKey`, so there is one source of persistence. The playground demonstrates this setup, including editor groups and two shortcuts: Alt+B for the sidebar and Alt+J for the bottom panel.

## Components

All examples use `import { … } from "@fruitui/react"`. See `apps/playground/src/App.tsx` for a working workspace with resizing, an explorer, and editor splits.

### Workspace and panels

`Workspace` is the outer container. It accepts normal `div` props and children.

`WorkspaceLayout` takes an `editor` node and optional `sidebar` and `secondarySidebar` nodes, plus a `bottomPanel` node. Pass `visibility` to control the optional panels, and listen to `onHorizontalLayoutChange` and `onVerticalLayoutChange` for completed resizes. `storageKey` saves sizes; alternatively, use the workspace store and `defaultHorizontalLayout` / `defaultVerticalLayout`.

```tsx
<Workspace>
  <WorkspaceLayout
    sidebar={<Sidebar title="Explorer">Files</Sidebar>}
    editor={<div>Editor</div>}
    bottomPanel={<div>Terminal</div>}
  />
  <StatusBar left="Ready" right="UTF-8" />
</Workspace>
```

`Sidebar` accepts `title` and `children`. `StatusBar` accepts `left` and `right` content. `ActivityBar` takes `items` (`id`, `label`, `icon`), `activeId`, and `onActiveChange`.

### File tree

`FileTree` takes `nodes`, `expandedIds`, `onExpandedChange`, `selectedId`, and `onSelect`. Each node needs a unique ID. Folder nodes have a `children` array. The app owns the data and implements file operations; the component does not access a filesystem.

```tsx
<FileTree
  nodes={nodes}
  expandedIds={expandedIds}
  onExpandedChange={setExpandedIds}
  selectedId={selectedId}
  onSelect={(node) => setSelectedId(node.id)}
  onRename={(node) => console.log("Rename", node.id)}
/>
```

Optional callbacks are `onCreateFile`, `onCreateFolder`, `onRename`, `onDelete`, and `onRefresh`. `renderIcon(node, expanded)` can override the default icons. Arrow keys navigate the tree, and Enter or Space opens a folder or selects a file.

### Editors

`EditorGroup` accepts `id`, `tabs`, `activeTabId`, `onActiveTabChange`, optional `onTabClose` and `onTabReorder`, `children` for active content, and `emptyState` for an empty group. Set a tab's `modified` field to show its dirty indicator. The app decides whether closing a dirty tab needs confirmation.

```tsx
<EditorGroup
  id="main"
  tabs={tabs}
  activeTabId={activeTabId}
  onActiveTabChange={setActiveTabId}
  onTabClose={closeTab}
  onTabReorder={setTabs}
  emptyState={<p>Open a file to begin.</p>}
>
  <div>Editor content</div>
</EditorGroup>
```

`EditorSplit` takes an `orientation` (`horizontal` or `vertical`) and a `groups` array of `{ id, content }`. Each group can contain an independent `EditorGroup`. `EditorArea` is the lower-level tab strip and content container used by `EditorGroup`; it takes the same tab and callback props. Tab reordering currently uses pointer drag-and-drop and does not support keyboard reordering or moving tabs between groups.
