"use client";

import type { EditorConfig, NodeKey, SerializedLexicalNode, Spread } from "lexical";
import { DecoratorNode } from "lexical";

type SerializedImageNode = Spread<
    {
        type: "image";
        version: 1;
        src: string;
        alt?: string;
        width?: number;
        height?: number;
    },
    SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
    __src: string;
    __alt?: string;
    __width?: number;
    __height?: number;

    static getType(): string {
        return "image";
    }

    static clone(node: ImageNode): ImageNode {
        return new ImageNode(node.__src, node.__alt, node.__width, node.__height, node.__key);
    }

    constructor(src: string, alt?: string, width?: number, height?: number, key?: NodeKey) {
        super(key);
        this.__src = src;
        this.__alt = alt;
        this.__width = width;
        this.__height = height;
    }

    createDOM(): HTMLElement {
        const span = document.createElement("span");
        return span;
    }

    updateDOM(): boolean {
        return false;
    }

    exportJSON(): SerializedImageNode {
        return {
            type: "image",
            version: 1,
            src: this.__src,
            alt: this.__alt,
            width: this.__width,
            height: this.__height,
        };
    }

    static importJSON(serializedNode: SerializedImageNode): ImageNode {
        const { src, alt, width, height } = serializedNode;
        return new ImageNode(src, alt, width, height);
    }

    decorate(_editor: unknown, _config: EditorConfig): JSX.Element {
        const width = this.__width ?? 400;
        const height = this.__height ?? 300;
        return (
            <span className="block my-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={this.__src} alt={this.__alt ?? ""} width={width} height={height} className="max-w-full h-auto" />
            </span>
        );
    }
}

export function $createImageNode(src: string, alt?: string, width?: number, height?: number): ImageNode {
    return new ImageNode(src, alt, width, height);
}


