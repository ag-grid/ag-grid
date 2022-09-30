import { Group, Path } from "ag-charts-community";
export interface CreateColumnRectsParams {
    stacked: boolean;
    root: Group;
    data: any;
    size: number;
    padding: number;
    xScaleDomain: number[];
    yScaleDomain: number[];
    xScalePadding: number;
}
export declare function createColumnRects(params: CreateColumnRectsParams): any;
export declare function createLinePaths(root: Group, data: number[][], size: number, padding: number): Path[];
