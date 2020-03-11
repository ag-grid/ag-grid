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
    set active(value: boolean);
    get active(): boolean;
    private _dirtyPath;
    set dirtyPath(value: boolean);
    get dirtyPath(): boolean;
    private _x;
    set x(value: number);
    get x(): number;
    private _y;
    set y(value: number);
    get y(): number;
    private _width;
    set width(value: number);
    get width(): number;
    private _height;
    set height(value: number);
    get height(): number;
    updatePath(): void;
    render(ctx: CanvasRenderingContext2D): void;
}
