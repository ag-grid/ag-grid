import { _ModuleSupport } from 'ag-charts-community';

export interface DefinedZoomState extends _ModuleSupport.AxisZoomState {
    x: { min: number; max: number };
    y: { min: number; max: number };
}
