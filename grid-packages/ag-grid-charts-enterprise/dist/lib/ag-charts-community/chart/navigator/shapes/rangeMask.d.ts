import { BBox } from '../../../scene/bbox';
import { Path } from '../../../scene/shape/path';
export declare class RangeMask extends Path {
    static className: string;
    x: number;
    y: number;
    width: number;
    height: number;
    readonly minRange = 0.001;
    protected _min: number;
    set min(value: number);
    get min(): number;
    protected _max: number;
    set max(value: number);
    get max(): number;
    onRangeChange?: () => any;
    computeBBox(): BBox;
    computeVisibleRangeBBox(): BBox;
    updatePath(): void;
}
