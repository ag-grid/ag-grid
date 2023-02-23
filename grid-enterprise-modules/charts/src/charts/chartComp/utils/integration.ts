import { AgChartInstance } from "ag-charts-community";

export function deproxy(chartOrProxy: AgChartInstance): AgChartActual {
    if ((chartOrProxy as any).chart != null) {
        return (chartOrProxy as any).chart;
    }
    return chartOrProxy as AgChartActual;
}

import { AgCartesianAxisType, _Scene } from 'ag-charts-community';

// Extensions to the public ag-charts-community API that Integrated Charts currently depends on for
// correct operation. Over time we aim to eliminate these and only use the public API.
//
// AVOID ADDING MORE DEPENDENCIES ON THESE PRIVATE APIS.

export interface AgChartActual extends AgChartInstance {
    title?: _Scene.Caption;
    width: number;
    height: number;
    series: {
        type: string;
        toggleSeriesItem(itemId: string, enabled: boolean): void;
    }[];
    axes?: {
        type: AgCartesianAxisType;
        direction: 'x' | 'y';
    }[];
    scene: {
        canvas: {
            element: HTMLCanvasElement;
        };
        getDataURL(type?: string): string;
    };
    addEventListener(type: 'click', cb: (even: any) => void): void;
    waitForUpdate(): Promise<void>;
}
