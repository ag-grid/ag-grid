import { Chart, TransferableResources } from './chart';
import { Padding } from '../util/padding';
export declare class PolarChart extends Chart {
    static className: string;
    static type: "polar";
    padding: Padding;
    constructor(document?: Document, overrideDevicePixelRatio?: number, resources?: TransferableResources);
    performLayout(): Promise<void>;
    private computeSeriesRect;
    private computeCircle;
    private refineCircle;
}
