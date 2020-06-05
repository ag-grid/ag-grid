import { BeanStub, CellRange, ChartType, Column, IAggFunc, IRangeController, CellRangeParams } from "@ag-grid-community/core";
export interface ColState {
    column?: Column;
    colId: string;
    displayName: string;
    selected: boolean;
    order: number;
}
export interface ChartModelParams {
    pivotChart: boolean;
    chartType: ChartType;
    aggFunc?: string | IAggFunc;
    cellRange: CellRange;
    suppressChartRanges: boolean;
}
export declare class ChartDataModel extends BeanStub {
    static DEFAULT_CATEGORY: string;
    private columnController;
    private gridOptionsWrapper;
    private valueService;
    rangeController: IRangeController;
    private rowRenderer;
    private chartTranslator;
    private referenceCellRange;
    private dimensionCellRange?;
    private valueCellRange?;
    private dimensionColState;
    private valueColState;
    private chartData;
    private readonly pivotChart;
    private chartType;
    private readonly suppressChartRanges;
    private readonly aggFunc?;
    private datasource;
    private readonly chartId;
    private detached;
    private grouping;
    private columnNames;
    constructor(params: ChartModelParams);
    private init;
    updateCellRanges(updatedColState?: ColState): void;
    getData(): any[];
    setChartType(chartType: ChartType): void;
    isGrouping(): boolean;
    isPivotActive(): boolean;
    isPivotMode(): boolean;
    isPivotChart(): boolean;
    getChartId(): string;
    getValueColState(): ColState[];
    getDimensionColState(): ColState[];
    getCellRanges(): CellRange[];
    getCellRangeParams(): CellRangeParams;
    getChartType(): ChartType;
    isSuppressChartRanges(): boolean;
    isDetached(): boolean;
    toggleDetached(): void;
    getSelectedValueColState(): {
        colId: string;
        displayName: string;
    }[];
    getSelectedValueCols(): Column[];
    getSelectedDimension(): ColState;
    private createCellRange;
    private getAllColumnsFromRanges;
    private getColDisplayName;
    private getRowIndexes;
    private getAllChartColumns;
    private isNumberCol;
    private extractLeafData;
    private displayNameMapper;
    private generateId;
    updateData(): void;
    private resetColumnState;
    private updateColumnState;
    private reorderColState;
    private setDimensionCellRange;
    private setValueCellRange;
}
