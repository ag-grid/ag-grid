import { BeanStub, ChartType, Column, IAggFunc, SeriesChartType, PartialCellRange, CellRange, SeriesGroupType } from "ag-grid-community";
import { ComboChartModel } from "./comboChartModel";
import { AgCartesianAxisType } from "ag-charts-community";
export interface ColState {
    column?: Column;
    colId: string;
    displayName: string | null;
    selected?: boolean;
    order: number;
}
export interface ChartModelParams {
    chartId: string;
    pivotChart?: boolean;
    chartType: ChartType;
    chartThemeName: string;
    switchCategorySeries?: boolean;
    aggFunc?: string | IAggFunc;
    cellRange: PartialCellRange;
    suppressChartRanges?: boolean;
    unlinkChart?: boolean;
    crossFiltering?: boolean;
    seriesChartTypes?: SeriesChartType[];
    seriesGroupType?: SeriesGroupType;
}
export declare class ChartDataModel extends BeanStub {
    static DEFAULT_CATEGORY: string;
    private readonly rangeService;
    private readonly chartTranslationService;
    readonly params: ChartModelParams;
    readonly chartId: string;
    suppressChartRanges: boolean;
    switchCategorySeries: boolean;
    aggFunc?: string | IAggFunc;
    pivotChart: boolean;
    categoryAxisType?: AgCartesianAxisType;
    chartType: ChartType;
    chartThemeName: string;
    unlinked: boolean;
    chartData: any[];
    groupChartData: any[] | undefined;
    valueColState: ColState[];
    dimensionColState: ColState[];
    columnNames: {
        [p: string]: string[];
    };
    valueCellRange?: CellRange;
    dimensionCellRange?: CellRange;
    comboChartModel: ComboChartModel;
    private chartColumnService;
    private datasource;
    referenceCellRange: PartialCellRange;
    suppliedCellRange: PartialCellRange;
    crossFiltering: boolean;
    private grouping;
    seriesGroupType?: SeriesGroupType;
    constructor(params: ChartModelParams);
    private setParams;
    private init;
    updateModel(params: ChartModelParams): void;
    updateCellRanges(params?: {
        updatedColState?: ColState;
        resetOrder?: boolean;
        maintainColState?: boolean;
        setColsFromRange?: boolean;
    }): void;
    updateData(): void;
    isGrouping(): boolean;
    getSelectedValueCols(): Column[];
    getSelectedDimensions(): ColState[];
    getColDisplayName(col: Column): string | null;
    isPivotMode(): boolean;
    getChartDataType(colId: string): string | undefined;
    private isPivotActive;
    private createCellRange;
    private getAllColumnsFromRanges;
    private getRowIndexes;
    private resetColumnState;
    private updateColumnState;
    private reorderColState;
    private setDimensionCellRange;
    private setValueCellRange;
    resetCellRanges(dimension: boolean, value: boolean): void;
    private updateSelectedDimensions;
    private syncDimensionCellRange;
    isComboChart(chartType?: ChartType): boolean;
}
