import { HdpiCanvas } from "../canvas/hdpiCanvas";
import { Node } from "./node";
interface DebugOptions {
    renderFrameIndex: boolean;
    renderBoundingBoxes: boolean;
}
export declare class Scene {
    static className: string;
    readonly id: string;
    readonly canvas: HdpiCanvas;
    private readonly ctx;
    constructor(document?: Document, width?: number, height?: number);
    set container(value: HTMLElement | undefined);
    get container(): HTMLElement | undefined;
    download(fileName?: string): void;
    getDataURL(type?: string): string;
    get width(): number;
    get height(): number;
    private pendingSize?;
    resize(width: number, height: number): void;
    private _dirty;
    private animationFrameId;
    set dirty(dirty: boolean);
    get dirty(): boolean;
    _root: Node | null;
    set root(node: Node | null);
    get root(): Node | null;
    readonly debug: DebugOptions;
    private _frameIndex;
    get frameIndex(): number;
    readonly render: () => void;
}
export {};
