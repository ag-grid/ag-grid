// ag-grid-enterprise v20.2.0
import { Shape } from "./shape";
/**
 * Circular arc node that uses the experimental `Path2D` class to define
 * the arc path for further rendering and hit-testing.
 */
export declare class Arc extends Shape {
    protected path: Path2D;
    private _x;
    x: number;
    private _y;
    y: number;
    private _radius;
    radius: number;
    private _startAngle;
    startAngle: number;
    private _endAngle;
    endAngle: number;
    private _counterClockwise;
    counterClockwise: boolean;
    updatePath(): void;
    isPointInPath(x: number, y: number): boolean;
    isPointInStroke(x: number, y: number): boolean;
    render(ctx: CanvasRenderingContext2D): void;
}
