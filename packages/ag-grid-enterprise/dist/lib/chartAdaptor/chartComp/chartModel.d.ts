// ag-grid-enterprise v21.2.2
import { BeanStub, CellRange, ChartType, Column, IAggFunc } from "ag-grid-community";
import { RangeController } from "../../rangeController";
import { Palette } from "../../charts/chart/palettes";
import { ChartProxy } from "./chartProxies/chartProxy";
export interface ColState {
    column?: Column;
    colId: string;
    displayName: string;
    selected: boolean;
}
export interface ChartModelParams {
    pivotChart: boolean;
    chartType: ChartType;
    aggFunc?: string | IAggFunc;
    cellRanges: CellRange[];
    palettes: Palette[];
    activePalette: number;
    suppressChartRanges: boolean;
}
export declare class ChartModel extends BeanStub {
    static DEFAULT_CATEGORY: string;
    private columnController;
    private gridOptionsWrapper;
    rangeController: RangeController;
    private rowRenderer;
    private cellRanges;
    private referenceCellRange;
    private dimensionColState;
    private valueColState;
    private chartData;
    private readonly pivotChart;
    private chartType;
    private activePalette;
    private readonly palettes;
    private readonly suppressChartRanges;
    private readonly aggFunc?;
    private initialising;
    private datasource;
    private readonly chartId;
    private chartProxy;
    private detached;
    private grouping;
    private columnNames;
    constructor(params: ChartModelParams);
    private init;
    updateData(): void;
    resetColumnState(): void;
    updateColumnState(updatedCol: ColState): void;
    updateCellRanges(updatedCol?: ColState): void;
    getData(): any[];
    setChartType(chartType: ChartType): void;
    isGrouping(): boolean;
    isPivotActive(): boolean;
    isPivotMode(): boolean;
    isPivotChart(): boolean;
    setChartProxy(chartProxy: ChartProxy<any>): void;
    getChartProxy(): ChartProxy<any>;
    getChartId(): string;
    getValueColState(): ColState[];
    getDimensionColState(): ColState[];
    getCellRanges(): CellRange[];
    getChartType(): ChartType;
    setActivePalette(palette: number): void;
    getActivePalette(): number;
    getPalettes(): Palette[];
    isSuppressChartRanges(): boolean;
    isDetached(): boolean;
    toggleDetached(): void;
    getSelectedValueColState(): {
        colId: string;
        displayName: string;
    }[];
    getSelectedValueCols(): Column[];
    getSelectedDimension(): ColState;
    private getColumnInDisplayOrder;
    private addRange;
    private getAllColumnsFromRanges;
    private getColDisplayName;
    private getRowIndexes;
    private getAllChartColumns;
    private isNumberCol;
    private extractLeafData;
    private displayNameMapper;
    private isMultiCategoryChart;
    private generateId;
    destroy(): void;
}
