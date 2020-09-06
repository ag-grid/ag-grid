import { Path } from "../../scene/shape/path";
import { BBox } from "../../scene/bbox";
import { ShapeLineCap } from "../../scene/shape/shape";
export declare class RangeHandle extends Path {
    static className: string;
    protected _fill: string;
    protected _stroke: string;
    protected _strokeWidth: number;
    protected _lineCap: ShapeLineCap;
    protected _centerX: number;
    centerX: number;
    protected _centerY: number;
    centerY: number;
    protected _width: number;
    width: number;
    protected _gripLineGap: number;
    gripLineGap: number;
    protected _gripLineLength: number;
    gripLineLength: number;
    protected _height: number;
    height: number;
    computeBBox(): BBox;
    isPointInPath(x: number, y: number): boolean;
    updatePath(): void;
}
