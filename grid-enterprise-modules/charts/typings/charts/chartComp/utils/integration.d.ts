import { AgChartInstance } from "ag-charts-community";
export declare function deproxy(chartOrProxy: AgChartInstance): AgChartActual;
import { AgCartesianAxisType, _Scene } from 'ag-charts-community';
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
