export type CommandHandler = (...args: unknown[]) => void | Promise<void>;

export interface CommandRegistry {
  register(id: string, handler: CommandHandler): () => void;
  execute(id: string, ...args: unknown[]): Promise<boolean>;
  has(id: string): boolean;
}

export function createCommandRegistry(): CommandRegistry {
  const handlers = new Map<string, CommandHandler>();
  return {
    register(id, handler) {
      if (!id.trim() || handlers.has(id)) throw new Error(`Command already registered or invalid: ${id}`);
      handlers.set(id, handler);
      return () => { if (handlers.get(id) === handler) handlers.delete(id); };
    },
    async execute(id, ...args) {
      const handler = handlers.get(id);
      if (!handler) return false;
      await handler(...args);
      return true;
    },
    has: (id) => handlers.has(id),
  };
}

export interface Keybinding { key: string; command: string; }

/** Modifier order and letter case do not affect shortcut matching. */
export function normalizeShortcut(shortcut: string): string {
  const parts = shortcut.toLowerCase().split('+').map((part) => part.trim());
  const modifiers = new Set<string>();
  let key = '';
  for (const part of parts) {
    const normalized = ({ control: 'ctrl', cmd: 'meta', command: 'meta', option: 'alt' } as Record<string, string>)[part] ?? part;
    if (['ctrl', 'alt', 'shift', 'meta'].includes(normalized)) {
      if (modifiers.has(normalized)) throw new Error(`Duplicate modifier: ${part}`);
      modifiers.add(normalized);
    } else if (normalized && !key) key = normalized;
    else throw new Error(`Invalid shortcut: ${shortcut}`);
  }
  if (!key) throw new Error(`Shortcut needs a key: ${shortcut}`);
  return [...['ctrl', 'alt', 'shift', 'meta'].filter((modifier) => modifiers.has(modifier)), key].join('+');
}

export function createKeybindings(bindings: Keybinding[]): Map<string, string> {
  const result = new Map<string, string>();
  for (const binding of bindings) {
    const key = normalizeShortcut(binding.key);
    if (!binding.command.trim() || result.has(key)) throw new Error(`Conflicting or invalid keybinding: ${binding.key}`);
    result.set(key, binding.command);
  }
  return result;
}

export function shortcutFromEvent(event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'>, physicalLetter = false): string | null {
  if (['Control', 'Shift', 'Alt', 'Meta'].includes(event.key)) return null;
  const code = (event as Partial<Pick<KeyboardEvent, 'code'>>).code;
  const key = physicalLetter && event.altKey && code && /^Key[A-Z]$/.test(code)
    ? code.slice(3).toLowerCase()
    : event.key.toLowerCase();
  return [event.ctrlKey && 'ctrl', event.altKey && 'alt', event.shiftKey && 'shift', event.metaKey && 'meta', key].filter(Boolean).join('+');
}
