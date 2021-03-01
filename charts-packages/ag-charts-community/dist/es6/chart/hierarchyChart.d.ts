import { ClipRect } from "../main";
import { Chart } from "./chart";
export declare class HierarchyChart extends Chart {
    static className: string;
    static type: string;
    constructor(document?: Document);
    protected _data: any;
    private _seriesRoot;
    readonly seriesRoot: ClipRect;
    performLayout(): void;
}
