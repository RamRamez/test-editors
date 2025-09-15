"use client";

import dynamic from "next/dynamic";

const LexicalEditor = dynamic(() => import("../components/LexicalEditor"), { ssr: false });
const EditorJSEditor = dynamic(() => import("../components/EditorJSEditor"), { ssr: false });

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
        <div className="flex flex-col gap-6 w-full max-w-5xl">
          <LexicalEditor />
          <EditorJSEditor />
        </div>
      </main>
    </div>
  );
}
