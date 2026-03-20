"use client";

import React, { useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TRANSFORMERS } from "@lexical/markdown";
import { $getRoot, $createParagraphNode, $createTextNode, EditorState } from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode } from "@lexical/code";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Undo,
  Redo,
  Link,
} from "lucide-react";
import {
  $createHeadingNode,
  $createQuoteNode,
} from "@lexical/rich-text";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import {
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from "lexical";

const URL_REGEX =
  /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

const MATCHERS = [
  (text: string) => {
    const match = URL_REGEX.exec(text);
    if (!match) return null;
    const url = match[0].startsWith("http") ? match[0] : `https://${match[0]}`;
    return { index: match.index, length: match[0].length, text: match[0], url };
  },
];

const EDITOR_THEME = {
  root: "min-h-[140px] outline-none px-4 py-3 text-sm leading-relaxed",
  heading: {
    h1: "text-xl font-bold mb-2",
    h2: "text-lg font-semibold mb-1.5",
    h3: "text-base font-medium mb-1",
  },
  quote:
    "border-l-4 border-primary/40 pl-3 text-muted-foreground italic my-2",
  list: {
    ul: "list-disc pl-5 space-y-1 my-1",
    ol: "list-decimal pl-5 space-y-1 my-1",
    listitem: "ml-1",
    nested: { listitem: "ml-4" },
  },
  link: "text-primary underline underline-offset-2 cursor-pointer",
  text: {
    bold: "font-semibold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "font-mono bg-muted px-1 py-0.5 rounded text-xs",
  },
  code: "font-mono bg-muted block p-3 rounded-lg text-xs my-2",
};

// ── Toolbar plugin ────────────────────────────────────────────────────────────

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const btn = (
    label: string,
    icon: React.ReactNode,
    action: () => void,
    title?: string
  ) => (
    <button
      key={label}
      type="button"
      onClick={(e) => {
        e.preventDefault();
        action();
      }}
      title={title ?? label}
      className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
    >
      {icon}
    </button>
  );

  return (
    <div className="flex items-center gap-0.5 px-3 py-2 border-b bg-muted/30 flex-wrap">
      {btn("Bold", <Bold className="h-3.5 w-3.5" />, () =>
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")
      )}
      {btn("Italic", <Italic className="h-3.5 w-3.5" />, () =>
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
      )}
      <div className="w-px h-4 bg-border mx-1" />
      {btn("Heading", <Heading2 className="h-3.5 w-3.5" />, () =>
        editor.update(() => {
          const selection = window.getSelection();
          if (selection) {
            const heading = $createHeadingNode("h2");
            // Insert heading at selection — simplified
          }
        })
      , "Heading 2")}
      {btn("Quote", <Quote className="h-3.5 w-3.5" />, () =>
        editor.update(() => {})
      )}
      <div className="w-px h-4 bg-border mx-1" />
      {btn("Bullet List", <List className="h-3.5 w-3.5" />, () =>
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
      )}
      {btn("Numbered List", <ListOrdered className="h-3.5 w-3.5" />, () =>
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
      )}
      <div className="w-px h-4 bg-border mx-1" />
      {btn("Undo", <Undo className="h-3.5 w-3.5" />, () =>
        editor.dispatchCommand(UNDO_COMMAND, undefined)
      )}
      {btn("Redo", <Redo className="h-3.5 w-3.5" />, () =>
        editor.dispatchCommand(REDO_COMMAND, undefined)
      )}
      <div className="ml-auto text-[10px] text-muted-foreground opacity-60 hidden sm:block">
        Markdown shortcuts supported
      </div>
    </div>
  );
}

// ── Initial value plugin ──────────────────────────────────────────────────────

function InitialValuePlugin({ value }: { value?: string }) {
  const [editor] = useLexicalComposerContext();
  const initialized = React.useRef(false);

  useEffect(() => {
    if (initialized.current || !value) return;
    initialized.current = true;
    editor.update(() => {
      const root = $getRoot();
      if (root.getFirstChild() === null || root.getTextContent() === "") {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(value));
        root.append(paragraph);
      }
    });
  }, [editor, value]);

  return null;
}

// ── Main component ────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value?: string;
  onChange?: (text: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write detailed task instructions here… (Markdown shortcuts supported)",
  className,
  minHeight = 160,
}: RichTextEditorProps) {
  const initialConfig = {
    namespace: "task-composer-editor",
    theme: EDITOR_THEME,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      LinkNode,
      AutoLinkNode,
    ],
    onError: (error: Error) => {
      console.error("Lexical editor error:", error);
    },
  };

  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const text = root.getTextContent();
      onChange?.(text);
    });
  };

  return (
    <div
      className={cn(
        "border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-ring transition-shadow",
        className
      )}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative" style={{ minHeight }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={EDITOR_THEME.root}
                style={{ minHeight }}
                aria-label="Task details editor"
              />
            }
            placeholder={
              <div className="absolute top-3 left-4 text-sm text-muted-foreground pointer-events-none select-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <CheckListPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <AutoLinkPlugin matchers={MATCHERS} />
          <OnChangePlugin onChange={handleChange} />
          <InitialValuePlugin value={value} />
        </div>
      </LexicalComposer>
    </div>
  );
}
