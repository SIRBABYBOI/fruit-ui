import { useCallback, useEffect, useState } from "react";
import type { WorkspacePanelVisibility } from "./workspace-layout";

const defaultVisibility: WorkspacePanelVisibility = {
  sidebar: true,
  secondarySidebar: true,
  bottomPanel: true,
};

interface StoredVisibility {
  version: 1;
  visibility: WorkspacePanelVisibility;
}

function readVisibility(storageKey: string): WorkspacePanelVisibility {
  if (typeof window === "undefined") {
    return defaultVisibility;
  }

  try {
    const raw = (
      window as Window & { localStorage: Storage }
    ).localStorage.getItem(storageKey);

    if (!raw) {
      return defaultVisibility;
    }

    const stored: unknown = JSON.parse(raw);

    if (
      typeof stored !== "object" ||
      stored === null ||
      !("version" in stored) ||
      stored.version !== 1 ||
      !("visibility" in stored) ||
      typeof stored.visibility !== "object" ||
      stored.visibility === null
    ) {
      return defaultVisibility;
    }

    const visibility = stored.visibility;

    if (
      !("sidebar" in visibility) ||
      typeof visibility.sidebar !== "boolean" ||
      !("secondarySidebar" in visibility) ||
      typeof visibility.secondarySidebar !== "boolean" ||
      !("bottomPanel" in visibility) ||
      typeof visibility.bottomPanel !== "boolean"
    ) {
      return defaultVisibility;
    }

    return {
      sidebar: visibility.sidebar,
      secondarySidebar: visibility.secondarySidebar,
      bottomPanel: visibility.bottomPanel,
    };
  } catch {
    return defaultVisibility;
  }
}

export function useWorkspaceVisibility(storageKey: string) {
  const [visibility, setVisibility] = useState<WorkspacePanelVisibility>(() =>
    readVisibility(storageKey),
  );

  useEffect(() => {
    try {
      const stored: StoredVisibility = {
        version: 1,
        visibility,
      };

      (window as Window & { localStorage: Storage }).localStorage.setItem(
        storageKey,
        JSON.stringify(stored),
      );
    } catch {
      // The layout still works if browser storage is unavailable.
    }
  }, [storageKey, visibility]);

  const togglePanel = useCallback((panel: keyof WorkspacePanelVisibility) => {
    setVisibility((current) => ({
      ...current,
      [panel]: !current[panel],
    }));
  }, []);

  return {
    visibility,
    setVisibility,
    togglePanel,
  };
}
