// ag-grid-enterprise v20.1.0
import { Shape } from "./shape";
import { Path2D } from "../path2D";
/**
 * Elliptical arc node.
 */
export declare class Arc extends Shape {
    static create(centerX: number, centerY: number, radiusX: number, radiusY: number, startAngle: number, endAngle: number, isCounterClockwise?: boolean): Arc;
    protected path: Path2D;
    /**
     * It's not always that the path has to be updated.
     * For example, if transform attributes (such as `translationX`)
     * are changed, we don't have to update the path. The `dirtyFlag`
     * is how we keep track if the path has to be updated or not.
     */
    private _isDirtyPath;
    isDirtyPath: boolean;
    private _centerX;
    centerX: number;
    private _centerY;
    centerY: number;
    private _radiusX;
    radiusX: number;
    private _radiusY;
    radiusY: number;
    private _startAngle;
    startAngle: number;
    private _endAngle;
    endAngle: number;
    private _isCounterClockwise;
    isCounterClockwise: boolean;
    startAngleDeg: number;
    endAngleDeg: number;
    updatePath(): void;
    readonly getBBox: () => {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    isPointInPath(x: number, y: number): boolean;
    isPointInStroke(x: number, y: number): boolean;
    render(ctx: CanvasRenderingContext2D): void;
}
