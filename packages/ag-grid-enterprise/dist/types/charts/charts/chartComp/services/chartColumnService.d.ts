import { BeanStub, Column } from "ag-grid-community";
export declare class ChartColumnService extends BeanStub {
    private readonly columnModel;
    private readonly valueService;
    private rowPositionUtils;
    private valueColsWithoutSeriesType;
    private postConstruct;
    getColumn(colId: string): Column | null;
    getAllDisplayedColumns(): Column[];
    getColDisplayName(col: Column): string | null;
    getRowGroupColumns(): Column[];
    getGroupDisplayColumns(): Column[];
    isPivotMode(): boolean;
    isPivotActive(): boolean;
    getChartColumns(): {
        dimensionCols: Set<Column>;
        valueCols: Set<Column>;
    };
    private isInferredValueCol;
    private extractLeafData;
    protected destroy(): void;
}
