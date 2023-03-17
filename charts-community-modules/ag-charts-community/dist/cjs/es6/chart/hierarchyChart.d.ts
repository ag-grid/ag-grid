import { Chart, TransferableResources } from './chart';
export declare class HierarchyChart extends Chart {
    static className: string;
    static type: "hierarchy";
    constructor(document?: Document, overrideDevicePixelRatio?: number, resources?: TransferableResources);
    protected _data: any;
    performLayout(): Promise<void>;
}
