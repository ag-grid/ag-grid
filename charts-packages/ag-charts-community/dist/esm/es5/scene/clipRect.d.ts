import { Node, RenderContext } from './node';
import { Path2D } from './path2D';
import { BBox } from './bbox';
/**
 * Acts as `Group` node but with specified bounds that form a rectangle.
 * Any parts of the child nodes outside that rectangle will not be visible.
 * Unlike the `Group` node, the `ClipRect` node cannot be transformed.
 */
export declare class ClipRect extends Node {
    static className: string;
    protected path: Path2D;
    constructor();
    containsPoint(x: number, y: number): boolean;
    enabled: boolean;
    private _dirtyPath;
    x: number;
    y: number;
    width: number;
    height: number;
    updatePath(): void;
    computeBBox(): BBox;
    render(renderCtx: RenderContext): void;
}
