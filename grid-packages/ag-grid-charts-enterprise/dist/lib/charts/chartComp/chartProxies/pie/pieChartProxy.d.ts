import { ChartProxy, ChartProxyParams, UpdateParams } from '../chartProxy';
export declare class PieChartProxy extends ChartProxy {
    constructor(params: ChartProxyParams);
    update(params: UpdateParams): void;
    private getSeries;
    private getCrossFilterData;
    private extractCrossFilterSeries;
    private static calculateOffsets;
    private getFields;
    crossFilteringReset(): void;
}
