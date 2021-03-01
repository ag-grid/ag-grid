import { Column, ColumnWidthCallbackParams, ExcelCell, ExcelColumn, ExcelRow, ExcelStyle, ExcelWorksheet, RowNode } from "@ag-grid-community/core";
import { BaseGridSerializingSession, GridSerializingParams, RowAccumulator, RowSpanningAccumulator, RowType } from "@ag-grid-community/csv-export";
export interface ExcelGridSerializingParams extends GridSerializingParams {
    sheetName: string;
    baseExcelStyles: ExcelStyle[];
    styleLinker: (rowType: RowType, rowIndex: number, colIndex: number, value: string, column?: Column, node?: RowNode) => string[];
    suppressTextAsCDATA?: boolean;
    rowHeight?: number;
    headerRowHeight?: number;
    columnWidth?: number | ((params: ColumnWidthCallbackParams) => number);
    autoConvertFormulas?: boolean;
}
interface ExcelMixedStyle {
    key: string;
    excelID: string;
    result: ExcelStyle;
}
export declare abstract class BaseExcelSerializingSession<T> extends BaseGridSerializingSession<ExcelCell[][]> {
    protected readonly config: ExcelGridSerializingParams;
    protected readonly stylesByIds: {
        [key: string]: ExcelStyle;
    };
    protected mixedStyles: {
        [key: string]: ExcelMixedStyle;
    };
    protected mixedStyleCounter: number;
    protected readonly excelStyles: ExcelStyle[];
    protected rows: ExcelRow[];
    protected cols: ExcelColumn[];
    constructor(config: ExcelGridSerializingParams);
    abstract onNewHeaderGroupingRow(): RowSpanningAccumulator;
    protected abstract createExcel(data: ExcelWorksheet): string;
    protected abstract getDataTypeForValue(valueForCell: string): T;
    protected abstract onNewHeaderColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node: RowNode) => void;
    protected abstract getType(type: T, style: ExcelStyle | null, value: string | null): T | null;
    protected abstract createCell(styleId: string | null, type: T, value: string): ExcelCell;
    protected abstract createMergedCell(styleId: string | null, type: T, value: string, numOfCells: number): ExcelCell;
    addCustomContent(customContent: ExcelCell[][]): void;
    prepare(columnsToExport: Column[]): void;
    parse(): string;
    onNewHeaderRow(): RowAccumulator;
    onNewBodyRow(): RowAccumulator;
    protected isFormula(value: string | null): boolean;
    protected getStyleById(styleId?: string | null): ExcelStyle | null;
    private convertColumnToExcel;
    private onNewRow;
    private onNewBodyColumn;
    private addNewMixedStyle;
}
export {};
