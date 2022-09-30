import { Node, RedrawType, RenderContext } from './node';
import { BBox } from './bbox';
import { HdpiCanvas } from '../canvas/hdpiCanvas';
import { Scene } from './scene';
import { Path2D } from './path2D';
import { HdpiOffscreenCanvas } from '../canvas/hdpiOffscreenCanvas';
export declare class Group extends Node {
    protected readonly opts?: {
        readonly layer?: boolean | undefined;
        readonly zIndex?: number | undefined;
        readonly zIndexSubOrder?: [string, number] | undefined;
        readonly name?: string | undefined;
        readonly optimiseDirtyTracking?: boolean | undefined;
    } | undefined;
    static className: string;
    protected layer?: HdpiCanvas | HdpiOffscreenCanvas;
    protected clipPath: Path2D;
    readonly name?: string;
    readonly dirtyChildren?: Record<string, Node>;
    readonly visibleChildren?: Record<string, Node>;
    opacity: number;
    protected opacityChanged(): void;
    protected zIndexChanged(): void;
    isLayer(): boolean;
    constructor(opts?: {
        readonly layer?: boolean | undefined;
        readonly zIndex?: number | undefined;
        readonly zIndexSubOrder?: [string, number] | undefined;
        readonly name?: string | undefined;
        readonly optimiseDirtyTracking?: boolean | undefined;
    } | undefined);
    append(nodes: Node[] | Node): void;
    _setScene(scene?: Scene): void;
    protected visibilityChanged(): void;
    removeChild<T extends Node>(node: T): T;
    markDirty(source: Node, type?: RedrawType): void;
    markClean(opts?: {
        force?: boolean;
        recursive?: boolean;
    }): void;
    containsPoint(_x: number, _y: number): boolean;
    computeBBox(): BBox;
    computeTransformedBBox(): BBox | undefined;
    render(renderCtx: RenderContext): void;
    private lastBBox?;
    private basicRender;
    private optimisedRender;
    private syncChildVisibility;
    private sortChildren;
}
