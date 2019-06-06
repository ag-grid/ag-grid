// ag-grid-enterprise v21.0.1
import { HdpiCanvas, DownloadOptions } from "../canvas/hdpiCanvas";
import { Node } from "./node";
import { Path2D } from "./path2D";
export declare class Scene {
    private static id;
    readonly id: string;
    private createId;
    readonly hdpiCanvas: HdpiCanvas;
    private readonly ctx;
    constructor(width?: number, height?: number);
    parent: HTMLElement | undefined;
    download(options?: DownloadOptions): void;
    private _width;
    width: number;
    private _height;
    height: number;
    size: [number, number];
    private _dirty;
    dirty: boolean;
    _root: Node | null;
    root: Node | null;
    appendPath(path: Path2D): void;
    private _frameIndex;
    readonly frameIndex: number;
    private _renderFrameIndex;
    renderFrameIndex: boolean;
    readonly render: () => void;
}
