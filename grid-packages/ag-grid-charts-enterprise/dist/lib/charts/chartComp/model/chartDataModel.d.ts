import { BeanStub, CellRange, ChartType, Column, IAggFunc, SeriesChartType } from "ag-grid-community";
import { ComboChartModel } from "./comboChartModel";
export interface ColState {
    column?: Column;
    colId: string;
    displayName: string | null;
    selected?: boolean;
    order: number;
}
export interface ChartModelParams {
    chartId: string;
    pivotChart: boolean;
    chartType: ChartType;
    chartThemeName: string;
    aggFunc?: string | IAggFunc;
    cellRange: CellRange;
    suppressChartRanges: boolean;
    unlinkChart?: boolean;
    crossFiltering?: boolean;
    seriesChartTypes?: SeriesChartType[];
}
export declare class ChartDataModel extends BeanStub {
    static DEFAULT_CATEGORY: string;
    private readonly rangeService;
    private readonly chartTranslationService;
    readonly params: ChartModelParams;
    readonly chartId: string;
    suppressChartRanges: boolean;
    aggFunc?: string | IAggFunc;
    pivotChart: boolean;
    chartType: ChartType;
    chartThemeName: string;
    unlinked: boolean;
    chartData: any[];
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
    referenceCellRange: CellRange;
    suppliedCellRange: CellRange;
    crossFiltering: boolean;
    private grouping;
    constructor(params: ChartModelParams);
    private init;
    updateModel(params: ChartModelParams): void;
    updateCellRanges(updatedColState?: ColState): void;
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
    private updateSelectedDimensions;
    private syncDimensionCellRange;
    isComboChart(): boolean;
}
