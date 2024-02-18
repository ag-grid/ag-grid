import type { ChartOptions } from '../module/optionsModule';
import { BBox } from '../scene/bbox';
import { Padding } from '../util/padding';
import type { TransferableResources } from './chart';
import { Chart } from './chart';
export declare class PolarChart extends Chart {
    static className: string;
    static type: "polar";
    padding: Padding;
    constructor(options: ChartOptions, resources?: TransferableResources);
    performLayout(): Promise<BBox>;
    protected updateAxes(cx: number, cy: number, radius: number): void;
    private computeSeriesRect;
    private computeCircle;
    private refineCircle;
}
