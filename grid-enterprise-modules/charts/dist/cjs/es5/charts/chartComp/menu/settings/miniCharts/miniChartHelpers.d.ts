import { _Scene } from 'ag-charts-community';
export interface CreateColumnRectsParams {
    stacked: boolean;
    root: _Scene.Group;
    data: any;
    size: number;
    padding: number;
    xScaleDomain: number[];
    yScaleDomain: number[];
    xScalePadding: number;
}
export declare function createColumnRects(params: CreateColumnRectsParams): any;
export declare function createLinePaths(root: _Scene.Group, data: number[][], size: number, padding: number): _Scene.Path[];
export declare function createPolarPaths(root: _Scene.Group, data: number[][], size: number, radius: number, innerRadius: number, markerSize?: number): {
    paths: _Scene.Path[];
    markers: _Scene.Circle[];
};
export declare function accumulateData(data: number[][]): {
    processedData: number[][];
    min: number;
    max: number;
};
