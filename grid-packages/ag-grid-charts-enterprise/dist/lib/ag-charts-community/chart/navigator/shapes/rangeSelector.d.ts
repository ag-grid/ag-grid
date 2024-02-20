import { Group } from '../../../scene/group';
import { RangeHandle } from './rangeHandle';
import { RangeMask } from './rangeMask';
export declare class RangeSelector extends Group {
    static className: string;
    private static defaults;
    readonly minHandle: RangeHandle;
    readonly maxHandle: RangeHandle;
    readonly background: Group;
    readonly mask: RangeMask;
    min: number;
    max: number;
    constructor();
    onRangeChange?: () => any;
    layout(x: number, y: number, width: number, height: number): void;
    updateHandles(): void;
    computeBBox(): import("../../../integrated-charts-scene").BBox;
    computeVisibleRangeBBox(): import("../../../integrated-charts-scene").BBox;
}
