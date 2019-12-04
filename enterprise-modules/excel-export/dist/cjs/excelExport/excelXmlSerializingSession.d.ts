import { Column, ExcelCell, ExcelColumn, ExcelDataType, ExcelOOXMLDataType, ExcelRow, ExcelStyle, ExcelWorksheet, RowNode } from '@ag-grid-community/core';
import { ExcelMixedStyle } from './excelCreator';
import { ExcelXmlFactory } from './excelXmlFactory';
import { ExcelXlsxFactory } from './excelXlsxFactory';
import { GridSerializingParams, RowType, BaseGridSerializingSession, RowAccumulator, RowSpanningAccumulator } from "@ag-grid-community/csv-export";
export interface ExcelGridSerializingParams extends GridSerializingParams {
    sheetName: string;
    excelFactory: ExcelXmlFactory | ExcelXlsxFactory;
    baseExcelStyles: ExcelStyle[];
    styleLinker: (rowType: RowType, rowIndex: number, colIndex: number, value: string, column?: Column, node?: RowNode) => string[];
    suppressTextAsCDATA?: boolean;
    rowHeight?: number;
    headerRowHeight?: number;
    columnWidth?: number | ((params: ColumnWidthCallbackParams) => number);
}
export interface ColumnWidthCallbackParams {
    column: Column | null;
    index: number;
}
export declare class ExcelXmlSerializingSession extends BaseGridSerializingSession<ExcelCell[][]> {
    protected stylesByIds: any | undefined;
    protected mixedStyles: {
        [key: string]: ExcelMixedStyle;
    };
    protected mixedStyleCounter: number;
    protected excelStyles: ExcelStyle[];
    protected rows: ExcelRow[];
    protected cols: ExcelColumn[];
    protected config: ExcelGridSerializingParams;
    constructor(config: ExcelGridSerializingParams);
    addCustomContent(customContent: ExcelCell[][]): void;
    prepare(columnsToExport: Column[]): void;
    onNewHeaderGroupingRow(): RowSpanningAccumulator;
    onNewHeaderRow(): RowAccumulator;
    onNewBodyRow(): RowAccumulator;
    onNewRow(onNewColumnAccumulator: (rowIndex: number, currentCells: ExcelCell[]) => (column: Column, index: number, node: RowNode) => void, height?: number): RowAccumulator;
    onNewHeaderColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node: RowNode) => void;
    parse(): string;
    protected createExcel(data: ExcelWorksheet[]): string;
    onNewBodyColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node: RowNode) => void;
    protected getDataTypeForValue(valueForCell: any): ExcelOOXMLDataType | ExcelDataType;
    addNewMixedStyle(styleIds: string[]): void;
    protected styleExists(styleId?: string): boolean;
    protected createCell(styleId: string | undefined, type: ExcelDataType | ExcelOOXMLDataType, value: string): ExcelCell;
    protected createMergedCell(styleId: string | undefined, type: ExcelDataType | ExcelOOXMLDataType, value: string, numOfCells: number): ExcelCell;
    private convertColumnToExcel;
}
