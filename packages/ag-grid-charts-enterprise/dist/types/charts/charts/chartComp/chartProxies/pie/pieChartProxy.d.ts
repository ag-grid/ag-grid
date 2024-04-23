import { ChartProxy, ChartProxyParams, UpdateParams } from '../chartProxy';
import { AgPolarChartOptions } from 'ag-charts-community';
export declare class PieChartProxy extends ChartProxy<AgPolarChartOptions, 'pie' | 'donut'> {
    constructor(params: ChartProxyParams);
    protected getUpdateOptions(params: UpdateParams, commonChartOptions: AgPolarChartOptions): AgPolarChartOptions;
    private getSeries;
    private getCrossFilterData;
    private extractCrossFilterSeries;
    private static calculateOffsets;
    private getFields;
}
