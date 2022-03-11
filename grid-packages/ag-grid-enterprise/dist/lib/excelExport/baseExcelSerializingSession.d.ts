import { Column, ColumnWidthCallbackParams, RowHeightCallbackParams, ExcelCell, ExcelColumn, ExcelHeaderFooterConfig, ExcelImage, ExcelRow, ExcelSheetMargin, ExcelSheetPageSetup, ExcelStyle, ExcelWorksheet, RowNode } from "ag-grid-community";
import { BaseGridSerializingSession, GridSerializingParams, RowAccumulator, RowSpanningAccumulator, RowType } from "ag-grid-community";
export interface ExcelGridSerializingParams extends GridSerializingParams {
    autoConvertFormulas?: boolean;
    baseExcelStyles: ExcelStyle[];
    columnWidth?: number | ((params: ColumnWidthCallbackParams) => number);
    headerFooterConfig?: ExcelHeaderFooterConfig;
    headerRowHeight?: number | ((params: RowHeightCallbackParams) => number);
    rowHeight?: number | ((params: RowHeightCallbackParams) => number);
    margins?: ExcelSheetMargin;
    pageSetup?: ExcelSheetPageSetup;
    sheetName: string;
    styleLinker: (rowType: RowType, rowIndex: number, value: string, column?: Column, node?: RowNode) => string[];
    addImageToCell?: (rowIndex: number, column: Column, value: string) => {
        image: ExcelImage;
        value?: string;
    } | undefined;
    suppressTextAsCDATA?: boolean;
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
    protected columnsToExport: Column[];
    constructor(config: ExcelGridSerializingParams);
    protected abstract createExcel(data: ExcelWorksheet): string;
    protected abstract getDataTypeForValue(valueForCell?: string): T;
    protected abstract getType(type: T, style: ExcelStyle | null, value: string | null): T | null;
    protected abstract createCell(styleId: string | null, type: T, value: string): ExcelCell;
    protected abstract addImage(rowIndex: number, column: Column, value: string): {
        image: ExcelImage;
        value?: string;
    } | undefined;
    protected abstract createMergedCell(styleId: string | null, type: T, value: string, numOfCells: number): ExcelCell;
    addCustomContent(customContent: ExcelCell[][]): void;
    onNewHeaderGroupingRow(): RowSpanningAccumulator;
    onNewHeaderRow(): RowAccumulator;
    onNewBodyRow(): RowAccumulator;
    prepare(columnsToExport: Column[]): void;
    parse(): string;
    protected isFormula(value: string | null): boolean | undefined;
    protected getStyleById(styleId?: string | null): ExcelStyle | null;
    private convertColumnToExcel;
    private onNewHeaderColumn;
    private onNewRow;
    private onNewBodyColumn;
    private getStyleId;
    private addNewMixedStyle;
}
export {};
