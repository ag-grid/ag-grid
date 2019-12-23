import { HdpiCanvas } from "../canvas/hdpiCanvas";
import { Node } from "./node";
import { Path2D } from "./path2D";
export declare class Scene {
    private static id;
    readonly id: string;
    private createId;
    readonly canvas: HdpiCanvas;
    private readonly ctx;
    constructor(document?: Document);
    parent: HTMLElement | undefined;
    download(fileName?: string): void;
    width: number;
    height: number;
    size: [number, number];
    private _dirty;
    private animationFrameId;
    dirty: boolean;
    cancelRender(): void;
    _root: Node | null;
    root: Node | null;
    appendPath(path: Path2D): void;
    private _frameIndex;
    readonly frameIndex: number;
    private _renderFrameIndex;
    renderFrameIndex: boolean;
    readonly render: () => void;
}
