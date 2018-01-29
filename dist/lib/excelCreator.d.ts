// ag-grid-enterprise v16.0.1
import { BaseCreator, BaseGridSerializingSession, Column, ColumnController, ExcelCell, ExcelExportParams, ExcelStyle, GridOptionsWrapper, IExcelCreator, ProcessCellForExportParams, ProcessHeaderForExportParams, RowAccumulator, RowNode, RowSpanningAccumulator, RowType, ValueService } from "ag-grid/main";
import { ExcelXmlFactory } from "./excelXmlFactory";
export interface ExcelMixedStyle {
    key: string;
    excelID: string;
    result: ExcelStyle;
}
export declare class ExcelGridSerializingSession extends BaseGridSerializingSession<ExcelCell[][]> {
    private excelXmlFactory;
    private styleLinker;
    private stylesByIds;
    private mixedStyles;
    private mixedStyleCounter;
    private excelStyles;
    private customHeader;
    private customFooter;
    private sheetName;
    constructor(columnController: ColumnController, valueService: ValueService, gridOptionsWrapper: GridOptionsWrapper, processCellCallback: (params: ProcessCellForExportParams) => string, processHeaderCallback: (params: ProcessHeaderForExportParams) => string, sheetName: string, excelXmlFactory: ExcelXmlFactory, baseExcelStyles: ExcelStyle[], styleLinker: (rowType: RowType, rowIndex: number, colIndex: number, value: string, column: Column, node: RowNode) => string[]);
    private rows;
    private cols;
    addCustomHeader(customHeader: ExcelCell[][]): void;
    addCustomFooter(customFooter: ExcelCell[][]): void;
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
export declare class ExcelCreator extends BaseCreator<ExcelCell[][], ExcelGridSerializingSession, ExcelExportParams> implements IExcelCreator {
    private excelXmlFactory;
    private columnController;
    private valueService;
    private gridOptions;
    private stylingService;
    private downloader;
    private gridSerializer;
    gridOptionsWrapper: GridOptionsWrapper;
    postConstruct(): void;
    exportDataAsExcel(params?: ExcelExportParams): string;
    getDataAsExcelXml(params?: ExcelExportParams): string;
    getMimeType(): string;
    getDefaultFileName(): string;
    getDefaultFileExtension(): string;
    createSerializingSession(params?: ExcelExportParams): ExcelGridSerializingSession;
    private styleLinker(rowType, rowIndex, colIndex, value, column, node);
    isExportSuppressed(): boolean;
}
