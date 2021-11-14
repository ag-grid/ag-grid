import { Group } from "../../scene/group";
import { RangeHandle } from "./rangeHandle";
import { RangeMask } from "./rangeMask";
import { BBox } from "../../scene/bbox";
export declare class RangeSelector extends Group {
    static className: string;
    protected isContainerNode: boolean;
    private static defaults;
    readonly minHandle: RangeHandle;
    readonly maxHandle: RangeHandle;
    readonly mask: RangeMask;
    protected _x: number;
    x: number;
    protected _y: number;
    y: number;
    protected _width: number;
    width: number;
    protected _height: number;
    height: number;
    protected _min: number;
    min: number;
    protected _max: number;
    max: number;
    onRangeChange?: (min: number, max: number) => any;
    private updateHandles;
    computeBBox(): BBox;
    computeVisibleRangeBBox(): BBox;
    render(ctx: CanvasRenderingContext2D): void;
}
