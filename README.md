# FruitUI

FruitUI is a collection of packages for building editor-style interfaces with React and connecting a WebView to a native host.

The project is in alpha. APIs and package contents may change.

## Packages

- [@fruitui/react](packages/react/README.md) — workspace, activity bar, sidebar, editor tabs, and status bar components.
- [@fruitui/core](packages/core/README.md) — shared TypeScript types.
- [@fruitui/zig-bridge](packages/zig-bridge/README.md) — request and response messaging for a WebView host.

## Getting started

Install the alpha React package alongside React 19:

```sh
npm install @fruitui/react@alpha react react-dom
```

Import the stylesheet and components in your app:

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

FruitUI styles its components. Your app supplies and styles the content inside them. The stylesheet also sets global page and button styles; see the [React package README](packages/react/README.md) for details.

## Development

This repository uses Bun. From the project root:

```sh
bun install
bun run build:packages
bun run dev
```

Other useful checks:

```sh
bun test packages/zig-bridge
bunx tsc --noEmit -p packages/zig-bridge/tsconfig.json
bun run build
```

Build the packages before running the playground after changing package source. The bridge tests use a simulated host; a real Zig WebView integration has not yet been validated.

## License

[MIT](LICENSE)
