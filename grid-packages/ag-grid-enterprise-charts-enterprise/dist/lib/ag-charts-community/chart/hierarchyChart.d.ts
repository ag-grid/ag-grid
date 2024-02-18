import type { ChartOptions } from '../module/optionsModule';
import { BBox } from '../scene/bbox';
import type { TransferableResources } from './chart';
import { Chart } from './chart';
export declare class HierarchyChart extends Chart {
    static className: string;
    static type: "hierarchy";
    constructor(options: ChartOptions, resources?: TransferableResources);
    protected _data: any;
    performLayout(): Promise<BBox>;
}
