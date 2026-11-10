import { useState } from "react";
import type { EditorTab } from "@fruitui/core";

export interface EditorGroupState {
  id: string;
  tabs: EditorTab[];
  activeTabId: string | null;
}

export interface EditorGroupsState {
  groups: EditorGroupState[];
  activeGroupId: string;
}

export function useEditorGroups(initialState: EditorGroupsState) {
  const [state, setState] = useState<EditorGroupsState>(initialState);

  function setActiveGroup(groupId: string) {
    setState((current) => {
      const exists = current.groups.some((group) => group.id === groupId);

      if (!exists) {
        return current;
      }

      return {
        ...current,
        activeGroupId: groupId,
      };
    });
  }

  function addGroup(groupId: string) {
    setState((current) => {
      const exists = current.groups.some((group) => group.id === groupId);

      if (exists) {
        return current;
      }

      return {
        groups: [
          ...current.groups,
          {
            id: groupId,
            tabs: [],
            activeTabId: null,
          },
        ],
        activeGroupId: groupId,
      };
    });
  }

  function removeGroup(groupId: string) {
    setState((current) => {
      // Keep at least one editor group available.
      if (
        current.groups.length <= 1 ||
        !current.groups.some((group) => group.id === groupId)
      ) {
        return current;
      }

      const groups = current.groups.filter((group) => group.id !== groupId);

      return {
        groups,
        activeGroupId:
          current.activeGroupId === groupId
            ? groups[0]!.id
            : current.activeGroupId,
      };
    });
  }

  function openTab(groupId: string, tab: EditorTab) {
    setState((current) => {
      if (!current.groups.some((group) => group.id === groupId)) {
        return current;
      }

      return {
        ...current,
        activeGroupId: groupId,
        groups: current.groups.map((group) => {
          if (group.id !== groupId) {
            return group;
          }

          const alreadyOpen = group.tabs.some(
            (existing) => existing.id === tab.id,
          );

          return {
            ...group,
            tabs: alreadyOpen ? group.tabs : [...group.tabs, tab],
            activeTabId: tab.id,
          };
        }),
      };
    });
  }

  function setActiveTab(groupId: string, tabId: string) {
    setState((current) => {
      const group = current.groups.find((item) => item.id === groupId);

      if (!group || !group.tabs.some((tab) => tab.id === tabId)) {
        return current;
      }

      return {
        ...current,
        activeGroupId: groupId,
        groups: current.groups.map((item) =>
          item.id === groupId ? { ...item, activeTabId: tabId } : item,
        ),
      };
    });
  }

  function closeTab(groupId: string, tabId: string) {
    setState((current) => ({
      ...current,
      groups: current.groups.map((group) => {
        if (group.id !== groupId) {
          return group;
        }

        const tabs = group.tabs.filter((tab) => tab.id !== tabId);

        return {
          ...group,
          tabs,
          activeTabId:
            group.activeTabId === tabId
              ? (tabs[0]?.id ?? null)
              : group.activeTabId,
        };
      }),
    }));
  }

  function reorderTabs(groupId: string, tabs: EditorTab[]) {
    setState((current) => ({
      ...current,
      groups: current.groups.map((group) => {
        if (group.id !== groupId) {
          return group;
        }

        // Accept only a reordering of the existing tabs.
        const existingIds = new Set(group.tabs.map((tab) => tab.id));
        const nextIds = new Set(tabs.map((tab) => tab.id));

        if (
          tabs.length !== group.tabs.length ||
          nextIds.size !== tabs.length ||
          [...nextIds].some((id) => !existingIds.has(id))
        ) {
          return group;
        }

        return {
          ...group,
          tabs,
        };
      }),
    }));
  }

  function renameTabEverywhere(tabId: string, title: string) {
    setState((current) => ({
      ...current,
      groups: current.groups.map((group) => ({
        ...group,
        tabs: group.tabs.map((tab) =>
          tab.id === tabId ? { ...tab, title } : tab,
        ),
      })),
    }));
  }

  function closeTabsEverywhere(tabIds: string[]) {
    const ids = new Set(tabIds);

    setState((current) => ({
      ...current,
      groups: current.groups.map((group) => {
        const tabs = group.tabs.filter((tab) => !ids.has(tab.id));

        return {
          ...group,
          tabs,
          activeTabId:
            group.activeTabId && ids.has(group.activeTabId)
              ? (tabs[0]?.id ?? null)
              : group.activeTabId,
        };
      }),
    }));
  }

  return {
    groups: state.groups,
    activeGroupId: state.activeGroupId,
    setActiveGroup,
    addGroup,
    removeGroup,
    openTab,
    setActiveTab,
    closeTab,
    reorderTabs,
    renameTabEverywhere,
    closeTabsEverywhere,
  };
}
