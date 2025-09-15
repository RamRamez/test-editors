"use client";

import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListItemNode, ListNode, REMOVE_LIST_COMMAND } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { $createHeadingNode, HeadingNode, QuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, type EditorState } from "lexical";
import { useMemo, useState } from "react";
import { $createImageNode, ImageNode } from "./LexicalImageNode";

function Toolbar() {
    const [editor] = useLexicalComposerContext();
    return (
        <div className="flex flex-wrap gap-2 mb-2">
            <button
                type="button"
                className="rounded border border-black/[.08] dark:border-white/[.145] px-2 py-1 text-xs hover:bg-black/[.05] dark:hover:bg-white/[.06]"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
            >
                Bold
            </button>
            <button
                type="button"
                className="rounded border border-black/[.08] dark:border-white/[.145] px-2 py-1 text-xs hover:bg-black/[.05] dark:hover:bg-white/[.06]"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
            >
                Italic
            </button>
            <button
                type="button"
                className="rounded border border-black/[.08] dark:border-white/[.145] px-2 py-1 text-xs hover:bg-black/[.05] dark:hover:bg-white/[.06]"
                onClick={() => {
                    editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                            $setBlocksType(selection, () => $createHeadingNode("h1"));
                        }
                    });
                }}
            >
                H1
            </button>
            <button
                type="button"
                className="rounded border border-black/[.08] dark:border-white/[.145] px-2 py-1 text-xs hover:bg-black/[.05] dark:hover:bg-white/[.06]"
                onClick={() => {
                    editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                            $setBlocksType(selection, () => $createHeadingNode("h2"));
                        }
                    });
                }}
            >
                H2
            </button>
            <button
                type="button"
                className="rounded border border-black/[.08] dark:border-white/[.145] px-2 py-1 text-xs hover:bg-black/[.05] dark:hover:bg-white/[.06]"
                onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
            >
                Bullet List
            </button>
            <button
                type="button"
                className="rounded border border-black/[.08] dark:border-white/[.145] px-2 py-1 text-xs hover:bg-black/[.05] dark:hover:bg-white/[.06]"
                onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
            >
                Numbered List
            </button>
            <button
                type="button"
                className="rounded border border-black/[.08] dark:border-white/[.145] px-2 py-1 text-xs hover:bg-black/[.05] dark:hover:bg-white/[.06]"
                onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)}
            >
                Remove List
            </button>
        </div>
    );
}

function InsertImageButton() {
    const [editor] = useLexicalComposerContext();
    return (
        <div className="flex gap-2 mb-2">
            <input
                type="file"
                accept="image/*"
                id="lexical-image-input"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                        const src = String(reader.result);
                        editor.update(() => {
                            const imageNode = $createImageNode(src, file.name);
                            const selection = $getSelection();
                            if ($isRangeSelection(selection)) {
                                selection.insertNodes([imageNode]);
                            }
                        });
                    };
                    reader.readAsDataURL(file);
                    e.currentTarget.value = "";
                }}
            />
            <button
                type="button"
                className="rounded border border-black/[.08] px-2 py-1 text-xs hover:bg-black/[.05]"
                onClick={() => document.getElementById("lexical-image-input")?.click()}
            >
                Insert Image
            </button>
        </div>
    );
}

export default function LexicalEditor() {
    const [json, setJson] = useState<string>("");
    const jsonSizeBytes = useMemo(() => (json ? new Blob([json]).size : 0), [json]);

    const initialConfig = useMemo(
        () => ({
            namespace: "lexical-editor",
            theme: {
                paragraph: "mb-2",
                heading: {
                    h1: "text-2xl font-semibold mb-2",
                    h2: "text-xl font-semibold mb-2",
                    h3: "text-lg font-semibold mb-2",
                },
                quote: "border-l-4 pl-3 italic text-gray-600 dark:text-gray-300",
                link: "text-blue-600 underline",
                list: {
                    listitem: "ml-6",
                },
            },
            onError(error: Error) {
                // eslint-disable-next-line no-console
                console.error(error);
            },
            nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode, LinkNode, ImageNode],
        }),
        []
    );

    function handleChange(editorState: EditorState) {
        editorState.read(() => {
            // Serialize the current editor state to JSON for comparison
            const serialized = editorState.toJSON();
            const str = JSON.stringify(serialized);
            setJson(str);
        });
    }

    function logOutput() {
        try {
            // eslint-disable-next-line no-console
            console.log("[Lexical] JSON output:", json ? JSON.parse(json) : {});
            // eslint-disable-next-line no-console
            console.log(`[Lexical] Size: ${jsonSizeBytes} bytes`);
        } catch {
            // eslint-disable-next-line no-console
            console.log("[Lexical] JSON output (string):", json);
        }
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Lexical</h2>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    Size: <span className="font-mono">{jsonSizeBytes}</span> bytes
                </div>
            </div>
            <div className="rounded-md border border-black/[.08]">
                <LexicalComposer initialConfig={initialConfig}>
                    <div className="p-3">
                        <Toolbar />
                        <InsertImageButton />
                        <RichTextPlugin
                            contentEditable={
                                <ContentEditable className="min-h-[200px] outline-none p-3 rounded bg-white text-black" />
                            }
                            placeholder={<div className="text-gray-500">Type here...</div>}
                            ErrorBoundary={LexicalErrorBoundary as any}
                        />
                        <HistoryPlugin />
                        <ListPlugin />
                        <LinkPlugin />
                        <OnChangePlugin onChange={handleChange} />
                    </div>
                </LexicalComposer>
            </div>
            <div className="flex gap-2 mt-3">
                <button
                    type="button"
                    onClick={logOutput}
                    className="rounded border border-black/[.08] px-3 py-1 text-sm hover:bg-black/[.05]"
                >
                    Log JSON
                </button>
            </div>
            {json && (
                <pre className="mt-3 max-h-48 overflow-auto text-xs bg-black/[.03] dark:bg-white/[.06] p-2 rounded">
                    {json}
                </pre>
            )}
        </div>
    );
}


