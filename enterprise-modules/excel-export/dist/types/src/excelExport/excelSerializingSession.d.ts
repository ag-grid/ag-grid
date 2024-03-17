import { Column, ColumnGroup, ColumnWidthCallbackParams, ExcelImage, ExcelHeaderFooterConfig, ExcelRow, ExcelSheetPageSetup, ExcelSheetMargin, ExcelStyle, ExcelTableConfig, RowHeightCallbackParams, RowNode } from '@ag-grid-community/core';
import { BaseGridSerializingSession, GridSerializingParams, RowAccumulator, RowSpanningAccumulator, RowType } from "@ag-grid-community/csv-export";
export interface StyleLinkerInterface {
    rowType: RowType;
    rowIndex: number;
    value: string;
    column?: Column;
    columnGroup?: ColumnGroup;
    node?: RowNode;
}
export interface ExcelGridSerializingParams extends GridSerializingParams {
    autoConvertFormulas?: boolean;
    baseExcelStyles: ExcelStyle[];
    columnWidth?: number | ((params: ColumnWidthCallbackParams) => number);
    headerFooterConfig?: ExcelHeaderFooterConfig;
    headerRowHeight?: number | ((params: RowHeightCallbackParams) => number);
    rowHeight?: number | ((params: RowHeightCallbackParams) => number);
    margins?: ExcelSheetMargin;
    pageSetup?: ExcelSheetPageSetup;
    exportAsExcelTable?: boolean | ExcelTableConfig;
    sheetName: string;
    suppressColumnOutline?: boolean;
    suppressRowOutline?: boolean;
    rowGroupExpandState?: 'expanded' | 'collapsed' | 'match';
    styleLinker: (params: StyleLinkerInterface) => string[];
    addImageToCell?: (rowIndex: number, column: Column, value: string) => {
        image: ExcelImage;
        value?: string;
    } | undefined;
}
export declare class ExcelSerializingSession extends BaseGridSerializingSession<ExcelRow[]> {
    private readonly config;
    private readonly stylesByIds;
    private mixedStyles;
    private mixedStyleCounter;
    private readonly excelStyles;
    private rows;
    private cols;
    private columnsToExport;
    constructor(config: ExcelGridSerializingParams);
    addCustomContent(customContent: ExcelRow[]): void;
    onNewHeaderGroupingRow(): RowSpanningAccumulator;
    onNewHeaderRow(): RowAccumulator;
    onNewBodyRow(node?: RowNode): RowAccumulator;
    prepare(columnsToExport: Column[]): void;
    parse(): string;
    private addRowOutlineIfNecessary;
    private isAnyParentCollapsed;
    private convertColumnToExcel;
    private onNewHeaderColumn;
    private onNewBodyColumn;
    private onNewRow;
    private createExcel;
    private getDataTypeForValue;
    private getTypeFromStyle;
    private addImage;
    private createCell;
    private createMergedCell;
    private getCellValue;
    private getStyleId;
    private deepCloneObject;
    private addNewMixedStyle;
    private isFormula;
    private isNumerical;
    private getStyleById;
}
