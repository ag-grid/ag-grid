// ag-grid-enterprise v21.2.2
import { Shape } from "./shape";
import { Path2D } from "../path2D";
import { BBox } from "../bbox";
export declare class Sector extends Shape {
    static className: string;
    protected path: Path2D;
    static create(centerX: number, centerY: number, innerRadius: number, outerRadius: number, startAngle?: number, endAngle?: number): Sector;
    private _dirtyPath;
    dirtyPath: boolean;
    private _centerX;
    centerX: number;
    private _centerY;
    centerY: number;
    private _centerOffset;
    centerOffset: number;
    private _innerRadius;
    innerRadius: number;
    private _outerRadius;
    outerRadius: number;
    private _startAngle;
    startAngle: number;
    private _endAngle;
    endAngle: number;
    private _angleOffset;
    angleOffset: number;
    readonly getBBox: () => BBox;
    isPointInPath(x: number, y: number): boolean;
    isPointInStroke(x: number, y: number): boolean;
    private readonly fullPie;
    updatePath(): void;
    render(ctx: CanvasRenderingContext2D): void;
}
