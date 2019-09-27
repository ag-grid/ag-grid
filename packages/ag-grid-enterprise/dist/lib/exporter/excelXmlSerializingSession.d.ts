// ag-grid-enterprise v21.2.2
import { BaseGridSerializingSession, Column, ExcelCell, ExcelColumn, ExcelDataType, ExcelOOXMLDataType, ExcelRow, ExcelStyle, GridSerializingParams, RowAccumulator, RowNode, RowSpanningAccumulator, RowType } from 'ag-grid-community';
import { ExcelMixedStyle } from './excelCreator';
import { ExcelXmlFactory } from './excelXmlFactory';
import { ExcelXlsxFactory } from './excelXlsxFactory';
export interface ExcelGridSerializingParams extends GridSerializingParams {
    sheetName: string;
    excelFactory: ExcelXmlFactory | ExcelXlsxFactory;
    baseExcelStyles: ExcelStyle[];
    styleLinker: (rowType: RowType, rowIndex: number, colIndex: number, value: string, column?: Column, node?: RowNode) => string[];
    suppressTextAsCDATA: boolean;
    rowHeight?: number;
    headerRowHeight?: number;
}
export declare class ExcelXmlSerializingSession extends BaseGridSerializingSession<ExcelCell[][]> {
    protected stylesByIds: any | undefined;
    protected mixedStyles: {
        [key: string]: ExcelMixedStyle;
    };
    protected mixedStyleCounter: number;
    protected excelStyles: ExcelStyle[];
    protected customHeader: ExcelCell[][];
    protected customFooter: ExcelCell[][];
    protected sheetName: string;
    protected suppressTextAsCDATA: boolean;
    protected rowHeight: number | undefined;
    protected headerRowHeight: number | undefined;
    protected rows: ExcelRow[];
    protected cols: ExcelColumn[];
    protected excelFactory: ExcelXmlFactory | ExcelXlsxFactory;
    baseExcelStyles: ExcelStyle[];
    protected styleLinker: (rowType: RowType, rowIndex: number, colIndex: number, value: string, column?: Column, node?: RowNode) => string[];
    constructor(config: ExcelGridSerializingParams);
    addCustomHeader(customHeader: ExcelCell[][]): void;
    addCustomFooter(customFooter: ExcelCell[][]): void;
    prepare(columnsToExport: Column[]): void;
    onNewHeaderGroupingRow(): RowSpanningAccumulator;
    onNewHeaderRow(): RowAccumulator;
    onNewBodyRow(): RowAccumulator;
    onNewRow(onNewColumnAccumulator: (rowIndex: number, currentCells: ExcelCell[]) => (column: Column, index: number, node: RowNode) => void, height?: number): RowAccumulator;
    onNewHeaderColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node: RowNode) => void;
    parse(): string;
    onNewBodyColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node: RowNode) => void;
    addNewMixedStyle(styleIds: string[]): void;
    protected styleExists(styleId?: string): boolean;
    protected createCell(styleId: string | undefined, type: ExcelDataType | ExcelOOXMLDataType, value: string): ExcelCell;
    protected createMergedCell(styleId: string | undefined, type: ExcelDataType | ExcelOOXMLDataType, value: string, numOfCells: number): ExcelCell;
}
