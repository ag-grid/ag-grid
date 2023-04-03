import { _ModuleSupport } from 'ag-charts-community';

export interface DefinedZoomState extends _ModuleSupport.AxisZoomState {
    x: { min: number; max: number };
    y: { min: number; max: number };
}

export type ZoomCoords = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};
