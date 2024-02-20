import { ChartProxy, ChartProxyParams, UpdateParams } from '../chartProxy';
import { AgNightingaleSeriesOptions, AgPolarAxisOptions, AgRadarAreaSeriesOptions, AgRadarLineSeriesOptions, AgRadialBarSeriesOptions, AgRadialColumnSeriesOptions } from 'ag-charts-community';
declare type AgPolarSeriesOptions = AgRadarLineSeriesOptions | AgRadarAreaSeriesOptions | AgNightingaleSeriesOptions | AgRadialBarSeriesOptions | AgRadialColumnSeriesOptions;
export declare class PolarChartProxy extends ChartProxy {
    constructor(params: ChartProxyParams);
    getAxes(_: UpdateParams): AgPolarAxisOptions[];
    getSeries(params: UpdateParams): AgPolarSeriesOptions[];
    update(params: UpdateParams): void;
    private getData;
    private getDataTransformedData;
    crossFilteringReset(): void;
}
export {};
