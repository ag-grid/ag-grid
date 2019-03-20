// ag-grid-enterprise v20.2.0
import { HdpiCanvas } from "../canvas/hdpiCanvas";
import { Node } from "./node";
import { Path2D } from "./path2D";
export declare class Scene {
    constructor(width?: number, height?: number);
    parent: HTMLElement | null;
    private static id;
    private createId;
    readonly id: string;
    readonly hdpiCanvas: HdpiCanvas;
    private readonly ctx;
    private setupListeners;
    private lastPick?;
    private onMouseMove;
    pickNode(node: Node, x: number, y: number): Node | undefined;
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
    render: () => void;
}
