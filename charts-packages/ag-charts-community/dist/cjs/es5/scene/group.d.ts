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
    } | undefined;
    static className: string;
    protected layer?: HdpiCanvas | HdpiOffscreenCanvas;
    protected clipPath: Path2D;
    readonly name?: string;
    opacity: number;
    protected zIndexChanged(): void;
    isLayer(): boolean;
    constructor(opts?: {
        readonly layer?: boolean | undefined;
        readonly zIndex?: number | undefined;
        readonly zIndexSubOrder?: [string, number] | undefined;
        readonly name?: string | undefined;
    } | undefined);
    _setScene(scene?: Scene): void;
    protected getComputedOpacity(): number;
    protected getVisibility(): boolean;
    protected visibilityChanged(): void;
    markDirty(source: Node, type?: RedrawType): void;
    containsPoint(_x: number, _y: number): boolean;
    computeBBox(): BBox;
    computeTransformedBBox(): BBox | undefined;
    private lastBBox?;
    render(renderCtx: RenderContext): void;
    private sortChildren;
}
