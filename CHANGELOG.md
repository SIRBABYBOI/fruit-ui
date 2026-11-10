# Changelog

## 0.2.0-alpha.1 — Unreleased

### Added

- Resizable workspace panels with visibility controls and saved layouts.
- A file tree with keyboard navigation, custom icons, and operation callbacks.
- Editor groups, split layouts, and tab reordering.
- Workspace state, commands, and configurable keyboard shortcuts.

### Known limitations

- File operations require an application-provided host.
- Tab reordering uses pointer drag-and-drop; keyboard reordering is not available yet.
- The Zig bridge has not yet been tested with a real Zig WebView host.

## 0.1.0-alpha.2 — Unreleased

### Added

- React components for an editor-style workspace, activity bar, sidebar, editor tabs, and status bar.
- Shared TypeScript types for tabs, activities, layouts, and commands.
- A WebView bridge with request IDs, error handling, and timeouts.
- Compiled CSS for the React components.

### Known limitations

- The API is in alpha and may change.
- Applications provide and style their own sidebar and editor content.
- The WebView bridge has been tested with a simulated host, but not yet with a real Zig integration.
