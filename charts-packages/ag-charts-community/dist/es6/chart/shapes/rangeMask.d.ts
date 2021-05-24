import { Path } from "../../scene/shape/path";
import { BBox } from "../../scene/bbox";
import { ShapeLineCap } from "../../main";
export declare class RangeMask extends Path {
    static className: string;
    protected _stroke: string;
    protected _strokeWidth: number;
    protected _fill: string;
    protected _fillOpacity: number;
    protected _lineCap: ShapeLineCap;
    protected _x: number;
    x: number;
    protected _y: number;
    y: number;
    protected _width: number;
    width: number;
    protected _height: number;
    height: number;
    minRange: number;
    protected _min: number;
    min: number;
    protected _max: number;
    max: number;
    onRangeChange?: (min: number, max: number) => any;
    computeBBox(): BBox;
    computeVisibleRangeBBox(): BBox;
    updatePath(): void;
}
