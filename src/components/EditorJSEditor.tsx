"use client";

import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import { useEffect, useMemo, useRef, useState } from "react";

type EditorJSInstance = any;

export default function EditorJSEditor() {
    const holderRef = useRef<HTMLDivElement | null>(null);
    const editorRef = useRef<EditorJSInstance | null>(null);
    const [data, setData] = useState<object | null>(null);

    const json = useMemo(() => (data ? JSON.stringify(data) : ""), [data]);
    const jsonSizeBytes = useMemo(() => (json ? new Blob([json]).size : 0), [json]);

    useEffect(() => {
        let isMounted = true;
        (async () => {
            if (editorRef.current) return;
            const List = (await import("@editorjs/list")).default as any;
            const Paragraph = (await import("@editorjs/paragraph")).default as any;
            const ImageTool = (await import("@editorjs/image")).default as any;
            // Simple inline tools for bold/italic using built-in Marker/Italic if available,
            // otherwise provide minimal custom inline tools.
            const BoldInline = {
                isInline: true,
                shortcut: "CMD+B",
                render() {
                    const button = document.createElement("button");
                    button.type = "button";
                    button.textContent = "B";
                    button.style.fontWeight = "bold";
                    return button;
                },
                surround(range: Range) {
                    const strong = document.createElement("b");
                    strong.appendChild(range.extractContents());
                    range.insertNode(strong);
                },
            } as any;

            const ItalicInline = {
                isInline: true,
                shortcut: "CMD+I",
                render() {
                    const button = document.createElement("button");
                    button.type = "button";
                    button.textContent = "I";
                    button.style.fontStyle = "italic";
                    return button;
                },
                surround(range: Range) {
                    const em = document.createElement("i");
                    em.appendChild(range.extractContents());
                    range.insertNode(em);
                },
            } as any;

            if (!holderRef.current) return;

            // Ensure holder is clean (avoid duplicate editor roots in Strict Mode)
            holderRef.current.innerHTML = "";

            const instance = new EditorJS({
                holder: holderRef.current,
                placeholder: "Type here...",
                tools: {
                    header: {
                        class: Header as any,
                        inlineToolbar: true,
                        config: {
                            placeholder: "Enter a header",
                            levels: [1, 2, 3, 4],
                            defaultLevel: 2,
                        },
                    },
                    list: {
                        class: List,
                        inlineToolbar: true,
                    },
                    paragraph: {
                        class: Paragraph,
                        inlineToolbar: true,
                    },
                    bold: BoldInline,
                    italic: ItalicInline,
                    image: {
                        class: ImageTool,
                        inlineToolbar: true,
                        config: {
                            uploader: {
                                async uploadByFile(file: File) {
                                    const dataUrl = await new Promise<string>((resolve, reject) => {
                                        const reader = new FileReader();
                                        reader.onload = () => resolve(String(reader.result));
                                        reader.onerror = reject;
                                        reader.readAsDataURL(file);
                                    });
                                    return {
                                        success: 1,
                                        file: {
                                            url: dataUrl,
                                        },
                                    } as const;
                                },
                                async uploadByUrl(url: string) {
                                    return {
                                        success: 1,
                                        file: { url },
                                    } as const;
                                },
                            },
                        },
                    },
                },
                onReady: () => {
                    editorRef.current = instance;
                },
            });

            // Store instance for cleanup
            editorRef.current = instance;
        })();

        return () => {
            isMounted = false;
            if (editorRef.current) {
                const toDestroy = editorRef.current;
                editorRef.current = null;
                // EditorJS provides a destroy method
                if (typeof toDestroy.destroy === "function") {
                    toDestroy.destroy();
                }
            }
        };
    }, []);

    async function saveAndLog() {
        if (!editorRef.current) return;
        const output = await editorRef.current.save();
        setData(output);
        // eslint-disable-next-line no-console
        console.log("[EditorJS] JSON output:", output);
        // eslint-disable-next-line no-console
        console.log(`[EditorJS] Size: ${new Blob([JSON.stringify(output)]).size} bytes`);
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">EditorJS</h2>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    Size: <span className="font-mono">{jsonSizeBytes}</span> bytes
                </div>
            </div>
            <div className="rounded-md border border-black/[.08]">
                <div ref={holderRef} className="min-h-[200px] p-3 bg-white text-black" />
            </div>
            <div className="flex gap-2 mt-3">
                <button
                    type="button"
                    onClick={saveAndLog}
                    className="rounded border border-black/[.08] px-3 py-1 text-sm hover:bg-black/[.05]"
                >
                    Save & Log JSON
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


