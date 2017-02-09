// ag-grid-enterprise v8.0.0
import { ColumnController } from 'ag-grid/main';
import { ValueService } from 'ag-grid/main';
import { Column } from 'ag-grid/main';
import { IExcelCreator } from 'ag-grid/main';
import { ExcelXmlFactory, ExcelCell, ExcelStyle } from "./excelXmlFactory";
import { RowAccumulator, RowType, BaseGridSerializingSession, RowSpanningAccumulator } from 'ag-grid/main';
import { RowNode } from 'ag-grid/main';
import { GridOptionsWrapper } from 'ag-grid/main';
import { ProcessCellForExportParams, ProcessHeaderForExportParams } from 'ag-grid/main';
import { ExportParams } from 'ag-grid/main';
export interface ExcelMixedStyle {
    key: string;
    excelID: string;
    result: ExcelStyle;
}
export declare class ExcelGridSerializingSession extends BaseGridSerializingSession {
    private excelXmlFactory;
    private styleLinker;
    private styleIds;
    private mixedStyles;
    private mixedStyleCounter;
    private excelStyles;
    constructor(columnController: ColumnController, valueService: ValueService, gridOptionsWrapper: GridOptionsWrapper, processCellCallback: (params: ProcessCellForExportParams) => string, processHeaderCallback: (params: ProcessHeaderForExportParams) => string, excelXmlFactory: ExcelXmlFactory, baseExcelStyles: ExcelStyle[], styleLinker: (rowType: RowType, rowIndex: number, colIndex: number, value: string, column: Column, node: RowNode) => string[]);
    private rows;
    private cols;
    addCustomHeader(customHeader: string): void;
    addCustomFooter(customFooter: string): void;
    prepare(columnsToExport: Column[]): void;
    onNewHeaderGroupingRow(): RowSpanningAccumulator;
    onNewHeaderRow(): RowAccumulator;
    onNewBodyRow(): RowAccumulator;
    onNewRow(onNewColumnAccumulator: (rowIndex: number, currentCells: ExcelCell[]) => (column: Column, index: number, node?: RowNode) => void): RowAccumulator;
    onNewHeaderColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node?: RowNode) => void;
    parse(): string;
    onNewBodyColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node?: RowNode) => void;
    addNewMixedStyle(styleIds: string[]): void;
    private styleExists(styleId);
    private createCell(styleId, type, value);
    private createMergedCell(styleId, type, value, numOfCells);
}
export declare class ExcelCreator implements IExcelCreator {
    private excelXmlFactory;
    private downloader;
    private columnController;
    private valueService;
    private gridSerializer;
    private gridOptionsWrapper;
    private gridOptions;
    private stylingService;
    exportDataAsExcel(params?: ExportParams): void;
    getDataAsExcelXml(params?: ExportParams): string;
    private styleLinker(rowType, rowIndex, colIndex, value, column, node);
}
