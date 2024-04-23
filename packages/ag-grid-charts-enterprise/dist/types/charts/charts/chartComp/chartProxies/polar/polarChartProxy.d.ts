import { ChartProxy, ChartProxyParams, UpdateParams } from '../chartProxy';
import { AgPolarAxisOptions, AgPolarChartOptions, AgPolarSeriesOptions } from 'ag-charts-community';
import { SeriesGroupType } from 'ag-grid-community';
export declare class PolarChartProxy extends ChartProxy<AgPolarChartOptions, 'radar-line' | 'radar-area' | 'nightingale' | 'radial-column' | 'radial-bar'> {
    constructor(params: ChartProxyParams);
    getAxes(_: UpdateParams): AgPolarAxisOptions[];
    getSeries(params: UpdateParams): AgPolarSeriesOptions[];
    getSeriesGroupType(): SeriesGroupType | undefined;
    protected getUpdateOptions(params: UpdateParams, commonChartOptions: AgPolarChartOptions): AgPolarChartOptions;
    private getData;
    private getSeriesGroupTypeOptions;
}
