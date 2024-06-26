import type { AgPolarChartOptions } from 'ag-charts-community';
import type { ChartProxyParams, UpdateParams } from '../chartProxy';
import { ChartProxy } from '../chartProxy';
export declare class PieChartProxy extends ChartProxy<AgPolarChartOptions, 'pie' | 'donut'> {
    constructor(params: ChartProxyParams);
    protected getUpdateOptions(params: UpdateParams, commonChartOptions: AgPolarChartOptions): AgPolarChartOptions;
    private getSeries;
    private getCrossFilterData;
    private extractCrossFilterSeries;
    private getFields;
}
