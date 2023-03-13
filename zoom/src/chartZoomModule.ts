import { _ModuleSupport } from 'ag-charts-community';
import { Zoom } from './zoom';

export const ZoomModule: _ModuleSupport.Module = {
    type: 'root',
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
        axes?: AgZoomAxes;
        enabled: boolean;
        enablePanning?: boolean;
        enableScrolling?: boolean;
        enableSelecting?: boolean;
        panKey?: 'alt' | 'ctrl' | 'meta' | 'shift';
        scrollingStep?: number;
    }
}
