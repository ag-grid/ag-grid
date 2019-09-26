// ag-grid-enterprise v21.2.2
import { Node } from "./node";
import { Path2D } from "./path2D";
/**
 * Acts as `Group` node but with specified bounds that form a rectangle.
 * Any parts of the child nodes outside that rectangle will not be visible.
 * Unlike the `Group` node, the `ClipRect` node cannot be transformed.
 */
export declare class ClipRect extends Node {
    static className: string;
    protected isContainerNode: boolean;
    protected path: Path2D;
    isPointInNode(x: number, y: number): boolean;
    private _active;
    active: boolean;
    private _dirtyPath;
    dirtyPath: boolean;
    private _x;
    x: number;
    private _y;
    y: number;
    private _width;
    width: number;
    private _height;
    height: number;
    updatePath(): void;
    render(ctx: CanvasRenderingContext2D): void;
}
