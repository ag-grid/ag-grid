// ag-grid-enterprise v20.0.0
import { Node } from "./node";
import { Path } from "./path";
export declare class Scene {
    constructor(parent: HTMLElement, width?: number, height?: number);
    private readonly hdpiCanvas;
    private readonly ctx;
    private setupListeners;
    private onMouseMove;
    _width: number;
    readonly width: number;
    _height: number;
    readonly height: number;
    size: [number, number];
    _dirty: boolean;
    dirty: boolean;
    _root?: Node;
    root: Node | undefined;
    appendPath(path: Path): void;
    render: () => void;
}
