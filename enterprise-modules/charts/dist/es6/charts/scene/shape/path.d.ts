import { Shape } from "./shape";
import { Path2D } from "../path2D";
export declare class Path extends Shape {
    static className: string;
    /**
     * Declare a path to retain for later rendering and hit testing
     * using custom Path2D class. Think of it as a TypeScript version
     * of the native Path2D (with some differences) that works in all browsers.
     */
    readonly path: Path2D;
    /**
    * The path only has to be updated when certain attributes change.
    * For example, if transform attributes (such as `translationX`)
    * are changed, we don't have to update the path. The `dirtyPath` flag
    * is how we keep track if the path has to be updated or not.
    */
    private _dirtyPath;
    dirtyPath: boolean;
    /**
     * Path definition in SVG path syntax:
     * https://www.w3.org/TR/SVG11/paths.html#DAttribute
     */
    private _svgPath;
    svgPath: string;
    isPointInPath(x: number, y: number): boolean;
    isPointInStroke(x: number, y: number): boolean;
    protected updatePath(): void;
    render(ctx: CanvasRenderingContext2D): void;
}
