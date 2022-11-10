import { AgCartesianAxisType, Integrated } from 'ag-charts-community';

// Extensions to the public ag-charts-community API that Integrated Charts currently depends on for
// correct operation. Over time we aim to eliminate these and only use the public API.
//
// AVOID ADDING MORE DEPENDENCIES ON THESE PRIVATE APIS.

declare module 'ag-charts-community' {
    interface AgChartInstance {
        title?: Integrated.Caption;
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
}
