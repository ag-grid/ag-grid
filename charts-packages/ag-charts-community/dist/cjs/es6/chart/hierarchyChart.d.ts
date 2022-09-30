import { ClipRect } from '../scene/clipRect';
import { Chart } from './chart';
export declare class HierarchyChart extends Chart {
    static className: string;
    static type: "hierarchy";
    constructor(document?: Document, overrideDevicePixelRatio?: number);
    protected _data: any;
    private _seriesRoot;
    get seriesRoot(): ClipRect;
    performLayout(): Promise<void>;
}
