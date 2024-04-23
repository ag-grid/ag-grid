import { _Scene, AgCartesianAxisType, AgChartInstance, AgPolarAxisOptions } from "ag-charts-community";
export declare function deproxy(chartOrProxy: AgChartInstance): AgChartActual;
export interface AgChartActual extends AgChartInstance {
    title?: _Scene.Caption;
    width: number;
    height: number;
    series: {
        type: string;
        toggleSeriesItem(itemId: string, enabled: boolean): void;
        properties: {
            [key: string]: any;
            toJson(): any;
        };
    }[];
    axes?: {
        type: AgCartesianAxisType | AgPolarAxisOptions['type'];
        direction: 'x' | 'y';
    }[];
    canvasElement: HTMLCanvasElement;
    getCanvasDataURL(type?: string): string;
    addEventListener(type: 'click', cb: (even: any) => void): void;
    waitForUpdate(): Promise<void>;
}
export type AgChartAxis = NonNullable<AgChartActual['axes']>[number];
export type AgChartAxisType = AgChartAxis['type'];
