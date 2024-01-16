import { BBox } from '../scene/bbox';
import type { ChartSpecialOverrides, TransferableResources } from './chart';
import { Chart } from './chart';
export declare class HierarchyChart extends Chart {
    static className: string;
    static type: "hierarchy";
    constructor(specialOverrides: ChartSpecialOverrides, resources?: TransferableResources);
    protected _data: any;
    performLayout(): Promise<BBox>;
}
