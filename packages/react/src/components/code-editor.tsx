import { useEffect, useRef } from "react";
import {
  Annotation,
  Compartment,
  EditorState,
  Transaction,
} from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers as lineNumbersExtension,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { indentUnit } from "@codemirror/language";

/**
 * Marks changes made from the value prop so they don't call onChange.
 */
const externalChange = Annotation.define<boolean>();

export interface CodeEditorProps {
  /**
   * The current document text.
   */
  value: string;

  /**
   * Called when the user changes the document.
   * The parent should update value with the new text.
   */
  onChange: (value: string) => void;

  readOnly?: boolean;
  lineNumbers?: boolean;
  lineWrapping?: boolean;

  /**
   * Width of a tab character. Defaults to 2.
   */
  tabSize?: number;

  /**
   * Use tabs for indentation instead of spaces.
   */
  indentWithTabs?: boolean;

  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  readOnly = false,
  lineNumbers = true,
  lineWrapping = false,
  tabSize = 2,
  indentWithTabs = false,
  className,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Compartments let us change configuration without recreating the editor.
  const configurationRef = useRef<Compartment | null>(null);

  if (configurationRef.current === null) {
    configurationRef.current = new Compartment();
  }

  const onChangeRef = useRef(onChange);

  // The listener should always call the latest callback.
  onChangeRef.current = onChange;

  // Keep the initial document and options for the first editor instance.
  const initialPropsRef = useRef({
    value,
    readOnly,
    lineNumbers,
    lineWrapping,
    tabSize,
    indentWithTabs,
  });

  function createConfiguration(options: {
    readOnly: boolean;
    lineNumbers: boolean;
    lineWrapping: boolean;
    tabSize: number;
    indentWithTabs: boolean;
  }) {
    const size =
      Number.isInteger(options.tabSize) && options.tabSize > 0
        ? options.tabSize
        : 2;

    return [
      EditorState.readOnly.of(options.readOnly),
      EditorView.editable.of(!options.readOnly),

      options.lineNumbers ? lineNumbersExtension() : [],

      options.lineWrapping ? EditorView.lineWrapping : [],

      EditorState.tabSize.of(size),

      indentUnit.of(options.indentWithTabs ? "\t" : " ".repeat(size)),
    ];
  }

  // Create one EditorView for this mounted component.
  useEffect(() => {
    const parent = containerRef.current;
    const configuration = configurationRef.current;

    if (!parent || !configuration) {
      return;
    }

    const initial = initialPropsRef.current;

    const state = EditorState.create({
      doc: initial.value,
      extensions: [
        history(),

        keymap.of([...defaultKeymap, ...historyKeymap]),

        configuration.of(createConfiguration(initial)),

        EditorView.updateListener.of((update) => {
          const changedByEditor = update.transactions.some(
            (transaction) =>
              transaction.docChanged && !transaction.annotation(externalChange),
          );

          if (changedByEditor) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent,
    });

    viewRef.current = view;

    return () => {
      viewRef.current = null;
      view.destroy();
    };
  }, []);

  // Apply configuration changes without destroying the editor.
  useEffect(() => {
    const view = viewRef.current;
    const configuration = configurationRef.current;

    if (!view || !configuration) {
      return;
    }

    view.dispatch({
      effects: configuration.reconfigure(
        createConfiguration({
          readOnly,
          lineNumbers,
          lineWrapping,
          tabSize,
          indentWithTabs,
        }),
      ),
    });
  }, [readOnly, lineNumbers, lineWrapping, tabSize, indentWithTabs]);

  // Apply changes from the parent without calling onChange again.
  useEffect(() => {
    const view = viewRef.current;

    if (!view || value === view.state.doc.toString()) {
      return;
    }

    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: value,
      },
      annotations: [
        externalChange.of(true),
        Transaction.addToHistory.of(false),
      ],
    });
  }, [value]);

  return <div ref={containerRef} className={className} />;
}
