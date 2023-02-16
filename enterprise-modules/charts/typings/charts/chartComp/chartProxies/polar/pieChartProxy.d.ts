import { ChartProxy, ChartProxyParams, UpdateChartParams } from '../chartProxy';
export declare class PieChartProxy extends ChartProxy {
    constructor(params: ChartProxyParams);
    update(params: UpdateChartParams): void;
    private getSeries;
    private getCrossFilterData;
    private extractCrossFilterSeries;
    private static calculateOffsets;
    private getFields;
    crossFilteringReset(): void;
}
