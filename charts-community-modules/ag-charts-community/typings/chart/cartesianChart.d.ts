import type { TransferableResources } from './chart';
import { Chart } from './chart';
import type { BBox } from '../scene/bbox';
export declare class CartesianChart extends Chart {
    static className: string;
    static type: string;
    /** Integrated Charts feature state - not used in Standalone Charts. */
    readonly paired: boolean;
    constructor(document?: Document, overrideDevicePixelRatio?: number, resources?: TransferableResources);
    performLayout(): Promise<BBox>;
    private _lastAxisWidths;
    private _lastVisibility;
    updateAxes(inputShrinkRect: BBox): {
        seriesRect: BBox;
        visibility: {
            crossLines: boolean;
            series: boolean;
        };
        clipSeries: boolean;
    };
    private updateAxesPass;
    private buildCrossLinePadding;
    private applySeriesPadding;
    private buildAxisBound;
    private buildSeriesRect;
    private clampToOutsideSeriesRect;
    private calculateAxisDimensions;
    private positionAxis;
}
//# sourceMappingURL=cartesianChart.d.ts.map