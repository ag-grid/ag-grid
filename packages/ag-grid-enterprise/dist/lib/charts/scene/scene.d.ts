// ag-grid-enterprise v20.1.0
import { Node } from "./node";
import { Path2D } from "./path2D";
export declare class Scene {
    constructor(width?: number, height?: number);
    parent: HTMLElement | null;
    private static id;
    private createId;
    readonly id: string;
    private readonly hdpiCanvas;
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
    _isDirty: boolean;
    isDirty: boolean;
    _root: Node | null;
    root: Node | null;
    appendPath(path: Path2D): void;
    private _frameIndex;
    readonly frameIndex: number;
    _isRenderFrameIndex: boolean;
    isRenderFrameIndex: boolean;
    render: () => void;
}
