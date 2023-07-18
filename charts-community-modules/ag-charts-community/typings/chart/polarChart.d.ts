import type { TransferableResources } from './chart';
import { Chart } from './chart';
import { Padding } from '../util/padding';
import { BBox } from '../scene/bbox';
export declare class PolarChart extends Chart {
    static className: string;
    static type: "polar";
    padding: Padding;
    constructor(document?: Document, overrideDevicePixelRatio?: number, resources?: TransferableResources);
    performLayout(): Promise<BBox>;
    protected updateAxes(cx: number, cy: number, radius: number): void;
    private computeSeriesRect;
    private computeCircle;
    private refineCircle;
}
//# sourceMappingURL=polarChart.d.ts.map