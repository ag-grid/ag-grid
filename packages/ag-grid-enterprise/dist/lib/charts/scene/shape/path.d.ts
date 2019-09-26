// ag-grid-enterprise v21.2.2
import { Shape } from "./shape";
import { Path2D } from "../path2D";
export declare class Path extends Shape {
    static className: string;
    /**
     * Make sure to set {@link dirty} to `true` after changing the path.
     */
    readonly path: Path2D;
    /**
     * Path definition in SVG path syntax:
     * https://www.w3.org/TR/SVG11/paths.html#DAttribute
     */
    private _svgPath;
    svgPath: string;
    isPointInPath(x: number, y: number): boolean;
    isPointInStroke(x: number, y: number): boolean;
    render(ctx: CanvasRenderingContext2D): void;
}
