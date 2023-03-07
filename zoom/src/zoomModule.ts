import { _ModuleSupport } from 'ag-charts-community';
import { Zoom } from './zoom';

export const ZoomModule: _ModuleSupport.Module = {
    optionsKey: 'zoom',
    chartTypes: ['cartesian'],
    initialiseModule(ctx: _ModuleSupport.ModuleContext) {
        const instance = new Zoom(ctx);
        return { instance };
    },
};

declare module 'ag-charts-community' {
    export interface AgCartesianChartOptions {
        zoom?: AgZoomOptions;
    }

    export type AgZoomAxes = 'x' | 'y' | 'xy';

    export interface AgZoomOptions {
        enabled?: boolean;
        axes?: AgZoomAxes;
    }
}
