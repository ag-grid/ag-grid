import type { SeriesChartType } from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';
import type { ChartDataModel } from './chartDataModel';
export declare class ComboChartModel extends BeanStub {
    static SUPPORTED_COMBO_CHART_TYPES: string[];
    seriesChartTypes: SeriesChartType[];
    savedCustomSeriesChartTypes: SeriesChartType[];
    private suppressComboChartWarnings;
    private chartDataModel;
    constructor(chartDataModel: ChartDataModel);
    postConstruct(): void;
    update(seriesChartTypes?: SeriesChartType[]): void;
    private initComboCharts;
    updateSeriesChartTypes(): void;
    private updateSeriesChartTypesForCustomCombo;
    private updateChartSeriesTypesForBuiltInCombos;
}
