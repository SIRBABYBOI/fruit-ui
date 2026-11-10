# @fruitui/core

Shared TypeScript types for FruitUI. This package currently contains types only.

Install the alpha package with:

```sh
npm install @fruitui/core@alpha
```

```ts
import type { EditorTab } from "@fruitui/core";

const tab: EditorTab = { id: "main", title: "main.zig" };
```

The package also exports `ActivityItem`, `WorkspaceLayout`, `FruitCommand`, and `FruitCommandHandler` types.
