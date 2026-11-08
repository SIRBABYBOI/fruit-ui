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
