import type { ReactNode } from "react";
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
  type Layout,
  type LayoutStorage,
} from "react-resizable-panels";

export interface WorkspacePanelVisibility {
  sidebar: boolean;
  secondarySidebar: boolean;
  bottomPanel: boolean;
}

export interface WorkspaceLayoutProps {
  sidebar?: ReactNode;
  editor: ReactNode;
  secondarySidebar?: ReactNode;
  bottomPanel: ReactNode;

  /**
   * Controls which optional panels are visible.
   * All panels are visible by default when their content is provided.
   */
  visibility?: Partial<WorkspacePanelVisibility>;

  /**
   * A unique key for saving panel sizes in localStorage.
   * Leave this out to disable size persistence
   */
  storageKey?: string;

  /** Initial sizes keyed by panel ID, useful with a workspace store. */
  defaultHorizontalLayout?: Layout | null;
  defaultVerticalLayout?: Layout | null;

  /**
   * Called when the user finishes resizing the horizontal panels.
   * Values are percentages keyed by panel ID.
   */
  onHorizontalLayoutChange?: (layout: Layout) => void;

  /**
   * Called when the user finishes resizing the editor or bottom panels.
   * Values are percentages keyed by panel ID.
   */
  onVerticalLayoutChange?: (layout: Layout) => void;
}

/**
 * The panel library expects a stroage object even when persistence is
 * disabled. This one keeps nothing.
 */
const emptyStorage: LayoutStorage = {
  getItem() {
    return null;
  },

  setItem() {
    // Persistence is disabled.
  },
};

/**
 * Keep a broken or unavailable localStorage entry from crashing the layout.
 */
const safeStorage: LayoutStorage = {
  getItem(key) {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const value = (
        window as Window & { localStorage: Storage }
      ).localStorage.getItem(key);

      if (value === null) {
        return null;
      }

      const parsed: unknown = JSON.parse(value);

      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        return null;
      }

      const sizes = Object.values(parsed);

      if (
        sizes.length === 0 ||
        !sizes.every(
          (size) =>
            typeof size === "number" &&
            Number.isFinite(size) &&
            size >= 0 &&
            size <= 100,
        )
      ) {
        return null;
      }

      return value;
    } catch {
      return null;
    }
  },

  setItem(key, value) {
    if (typeof window === "undefined") {
      return;
    }

    try {
      (window as Window & { localStorage: Storage }).localStorage.setItem(
        key,
        value,
      );
    } catch {
      // The layout remains usable if storage is unavailble.
    }
  },
};

export function WorkspaceLayout({
  sidebar,
  editor,
  secondarySidebar,
  bottomPanel,
  visibility,
  storageKey,
  defaultHorizontalLayout,
  defaultVerticalLayout,
  onHorizontalLayoutChange,
  onVerticalLayoutChange,
}: WorkspaceLayoutProps) {
  const showSidebar = sidebar != null && (visibility?.sidebar ?? true);
  const showSecondarySidebar =
    secondarySidebar != null && (visibility?.secondarySidebar ?? true);
  const showBottomPanel =
    bottomPanel != null && (visibility?.bottomPanel ?? true);

  const horizontalPanelIds = [
    ...(showSidebar ? ["sidebar"] : []),
    "center",
    ...(showSecondarySidebar ? ["secondary-sidebar"] : []),
  ];

  const verticalPanelIds = [
    "editor",
    ...(showBottomPanel ? ["bottom-panel"] : []),
  ];

  // A saved layout for a different combination of visible panels cannot be
  // applied to this group. Fall back to the panel defaults in that case.
  const matchesPanels = (layout: Layout | null | undefined, ids: string[]) =>
    layout && Object.keys(layout).length === ids.length && ids.every((id) => id in layout)
      ? layout
      : undefined;

  const horizontalLayout = useDefaultLayout({
    id: `${storageKey ?? "fruitui"}-horizontal`,
    panelIds: horizontalPanelIds,
    storage: storageKey ? safeStorage : emptyStorage,
    onlySaveAfterUserInteractions: true,
  });

  const verticalLayout = useDefaultLayout({
    id: `${storageKey ?? "fruitui"}-vertical`,
    panelIds: verticalPanelIds,
    storage: storageKey ? safeStorage : emptyStorage,
    onlySaveAfterUserInteractions: true,
  });

  return (
    <div className="min-h-0 min-w-0 flex-1">
      <Group
        orientation="horizontal"
        defaultLayout={matchesPanels(defaultHorizontalLayout, horizontalPanelIds) ?? horizontalLayout.defaultLayout}
        onLayoutChanged={(layout, meta) => {
          horizontalLayout.onLayoutChanged(layout, meta);

          if (meta.isUserInteraction) {
            onHorizontalLayoutChange?.(layout);
          }
        }}
      >
        {showSidebar && (
          <>
            <Panel id="sidebar" defaultSize="20%" minSize="10%" maxSize="40%">
              {sidebar}
            </Panel>

            <Separator
              aria-label="Resize sidebar"
              className="w-1 bg-fruit-border hover:bg-fruit-accent focus-visible:bg-fruit-accent"
            />
          </>
        )}

        <Panel id="center" minSize="30%">
          <Group
            orientation="vertical"
            defaultLayout={matchesPanels(defaultVerticalLayout, verticalPanelIds) ?? verticalLayout.defaultLayout}
            onLayoutChanged={(layout, meta) => {
              verticalLayout.onLayoutChanged(layout, meta);

              if (meta.isUserInteraction) {
                onVerticalLayoutChange?.(layout);
              }
            }}
          >
            <Panel id="editor" minSize="25%">
              {editor}
            </Panel>

            {showBottomPanel && (
              <>
                <Separator
                  aria-label="Resize bottom panel"
                  className="h-1 bg-fruit-border hover:bg-fruit-accent focus-visible:bg-fruit-accent"
                />

                <Panel
                  id="bottom-panel"
                  defaultSize="25%"
                  minSize="10%"
                  maxSize="60%"
                >
                  {bottomPanel}
                </Panel>
              </>
            )}
          </Group>
        </Panel>

        {showSecondarySidebar && (
          <>
            <Separator
              aria-label="Resize secondary sidebar"
              className="w-1 bg-fruit-border hover:bg-fruit-accent focus-visible:bg-fruit-accent"
            />

            <Panel
              id="secondary-sidebar"
              defaultSize="20%"
              minSize="10%"
              maxSize="40%"
            >
              {secondarySidebar}
            </Panel>
          </>
        )}
      </Group>
    </div>
  );
}
