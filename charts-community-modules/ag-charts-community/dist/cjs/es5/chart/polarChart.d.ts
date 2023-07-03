import { Chart, TransferableResources } from './chart';
import { Padding } from '../util/padding';
import { BBox } from '../scene/bbox';
export declare class PolarChart extends Chart {
    static className: string;
    static type: "polar";
    padding: Padding;
    constructor(document?: Document, overrideDevicePixelRatio?: number, resources?: TransferableResources);
    performLayout(): Promise<BBox>;
    private computeSeriesRect;
    private computeCircle;
    private refineCircle;
}
