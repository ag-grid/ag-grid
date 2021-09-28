import { HdpiCanvas } from "../canvas/hdpiCanvas";
import { Node } from "./node";
import { Path2D } from "./path2D";
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
    container: HTMLElement | undefined;
    download(fileName?: string): void;
    getDataURL(type?: string): string;
    readonly width: number;
    readonly height: number;
    private pendingSize?;
    resize(width: number, height: number): void;
    private _dirty;
    private animationFrameId;
    dirty: boolean;
    cancelRender(): void;
    _root: Node | null;
    root: Node | null;
    appendPath(path: Path2D): void;
    readonly debug: DebugOptions;
    private _frameIndex;
    readonly frameIndex: number;
    readonly render: () => void;
}
export {};
