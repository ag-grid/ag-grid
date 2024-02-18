import { BeanStub, SeriesChartType } from "ag-grid-community";
import { ChartDataModel } from "./chartDataModel";
export declare class ComboChartModel extends BeanStub {
    static SUPPORTED_COMBO_CHART_TYPES: string[];
    seriesChartTypes: SeriesChartType[];
    savedCustomSeriesChartTypes: SeriesChartType[];
    private suppressComboChartWarnings;
    private chartDataModel;
    constructor(chartDataModel: ChartDataModel);
    private init;
    update(seriesChartTypes?: SeriesChartType[]): void;
    private initComboCharts;
    updateSeriesChartTypes(): void;
    private updateSeriesChartTypesForCustomCombo;
    private updateChartSeriesTypesForBuiltInCombos;
}
