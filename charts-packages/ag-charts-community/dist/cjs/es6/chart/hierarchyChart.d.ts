import { ClipRect } from '../scene/clipRect';
import { Chart } from './chart';
export declare class HierarchyChart extends Chart {
    static className: string;
    static type: "hierarchy";
    constructor(document?: Document);
    protected _data: any;
    private _seriesRoot;
    get seriesRoot(): ClipRect;
    performLayout(): void;
}
