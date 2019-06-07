// ag-grid-enterprise v21.0.1
import { BeanStub, CellRange, ChartType, Column } from "ag-grid-community";
import { RangeController } from "../../rangeController";
import { Palette } from "../../charts/chart/palettes";
export interface ColState {
    column?: Column;
    colId: string;
    displayName: string;
    selected: boolean;
}
export interface ChartModelParams {
    chartType: ChartType;
    aggregate: boolean;
    cellRanges: CellRange[];
    palettes: Palette[];
    activePalette: number;
    suppressChartRanges: boolean;
}
export declare class ChartModel extends BeanStub {
    static DEFAULT_CATEGORY: string;
    private columnController;
    rangeController: RangeController;
    private rowRenderer;
    private cellRanges;
    private referenceCellRange;
    private dimensionColState;
    private valueColState;
    private chartData;
    private chartType;
    private activePalette;
    private palettes;
    private suppressChartRanges;
    private readonly aggregate;
    private initialising;
    private datasource;
    private chartId;
    constructor(params: ChartModelParams);
    private init;
    updateData(): void;
    resetColumnState(): void;
    updateColumnState(updatedCol: ColState): void;
    updateCellRanges(updatedCol?: ColState): void;
    getData(): any[];
    getChartId(): string;
    getValueColState(): ColState[];
    getDimensionColState(): ColState[];
    getCellRanges(): CellRange[];
    setChartType(chartType: ChartType): void;
    getChartType(): ChartType;
    setActivePalette(palette: number): void;
    getActivePalette(): number;
    getPalettes(): Palette[];
    isSuppressChartRanges(): boolean;
    getSelectedColState(): ColState[];
    getSelectedValueCols(): Column[];
    getSelectedDimensionId(): string;
    private getColumnInDisplayOrder;
    private addRange;
    private getAllColumnsFromRanges;
    private getColDisplayName;
    private getRowIndexes;
    private getAllChartColumns;
    private generateId;
    destroy(): void;
}
