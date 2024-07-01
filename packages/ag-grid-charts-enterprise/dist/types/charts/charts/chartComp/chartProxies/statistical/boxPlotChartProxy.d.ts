import type { AgBoxPlotSeriesOptions } from 'ag-charts-community';
import type { ChartProxyParams, UpdateParams } from '../chartProxy';
import { StatisticalChartProxy } from './statisticalChartProxy';
export declare class BoxPlotChartProxy extends StatisticalChartProxy<'box-plot'> {
    constructor(params: ChartProxyParams);
    getSeries(params: UpdateParams): AgBoxPlotSeriesOptions<any>[];
    protected getData(params: UpdateParams): any[];
    private quantile;
}
