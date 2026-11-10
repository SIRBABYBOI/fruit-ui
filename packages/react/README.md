# @fruitui/react

React components for an editor-style workspace: `Workspace`, `ActivityBar`, `Sidebar`, `EditorArea`, and `StatusBar`.

Once published, install the package with React 19 and React DOM 19:

```sh
npm install @fruitui/react react react-dom
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
