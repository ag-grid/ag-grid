import { Column } from "../entities/column";
import { ExportParams, PackageFileParams } from "./exportParams";
import { XmlElement } from "./iXmlFactory";

// Excel Styles
export interface ExcelStyle {
    id: string;
    alignment?: ExcelAlignment;
    borders?: ExcelBorders;
    font?: ExcelFont;
    interior?: ExcelInterior;
    numberFormat?: ExcelNumberFormat;
    protection?: ExcelProtection;
    dataType?: ExcelDataType;
    /* legacy properties */
    name?: string;
}

export interface ExcelAlignment {
    horizontal: 'Automatic' | 'Left' | 'Center' | 'Right' | 'Fill' | 'Justify' | 'CenterAcrossSelection' | 'Distributed' | 'JustifyDistributed';
    indent: number;
    readingOrder: 'RightToLeft' | 'LeftToRight' | 'Context';
    rotate: number;
    shrinkToFit: boolean;
    vertical: 'Automatic' | 'Top' | 'Bottom' | 'Center' | 'Justify' | 'Distributed' | 'JustifyDistributed';
    wrapText: boolean;
    /* legacy properties */
    verticalText: boolean;
}

export interface ExcelBorders {
    borderBottom: ExcelBorder;
    borderLeft: ExcelBorder;
    borderTop: ExcelBorder;
    borderRight: ExcelBorder;
}

export interface ExcelBorder {
    lineStyle: 'None' | 'Continuous' | 'Dash' | 'Dot' | 'DashDot' | 'DashDotDot' | 'SlantDashDot' | 'Double';
    weight: 0 | 1 | 2 | 3;
    color: string;
}

export interface ExcelFont {
    bold: boolean;
    color: string;
    fontName: string;
    italic: boolean;
    outline: boolean;
    shadow: boolean;
    size: number;
    strikeThrough: boolean;
    underline: 'None' | 'Subscript' | 'Superscript';
    charSet: number;
    family: string;
    /* legacy property */
    verticalAlign: string;
}

export interface ExcelInterior {
    color: string;
    pattern: 'None' | 'Solid' | 'Gray75' | 'Gray50' | 'Gray25' | 'Gray125' | 'Gray0625' | 'HorzStripe' | 'VertStripe' | 'ReverseDiagStripe' | 'DiagStripe' | 'DiagCross' | 'ThickDiagCross' | 'ThinHorzStripe' | 'ThinVertStripe' | 'ThinReverseDiagStripe' | 'ThinDiagStripe' | 'ThinHorzCross' | 'ThinDiagCross';
    patternColor: string;
}

export interface ExcelNumberFormat {
    format: string;
}

export interface ExcelProtection {
    protected: boolean;
    hideFormula: boolean;
}

// Excel Structure
export interface ExcelWorksheet {
    name: string;
    table: ExcelTable;
    config?: ExcelSheetConfig;
}

export interface ExcelTable {
    columns: ExcelColumn[];
    rows: ExcelRow[];
}

export interface ExcelColumn {
    min?: number;
    max?: number;
    width?: number;
    s?: number;
    hidden?: boolean;
    bestFit?: boolean;
}

export interface ExcelRow {
    index?: number;
    collapsed?: boolean;
    hidden?: boolean;
    height?: number;
    outlineLevel?: number;
    s?: number;
    cells: ExcelCell[];
}

export interface ExcelCell {
    ref?: string;
    styleId?: string;
    data: ExcelData;
    mergeAcross?: number;
}

/*
 * OOXML Data Types
 * (str): String
 * (s): Shared String
 * (f): Formula
 * (inlineStr): Inline string
 * Note: Inline strings are placed in a `is` element instead of `v`
 * (n) Number
 * (b) Boolean
 * (d) DateTime
 * (e) Error
*/
export type ExcelDataType = 'String' | 'Formula' | 'Number' | 'Boolean' | 'DateTime' | 'Error';
export type ExcelOOXMLDataType = 'str' | 's' | 'f' | 'inlineStr' | 'n' | 'b' | 'd' | 'e' | 'empty';

export interface ExcelData {
    type: ExcelDataType | ExcelOOXMLDataType;
    value: string | null;
}

export interface ExcelRelationship {
    Id: string;
    Type: string;
    Target: string;
}

export interface ExcelContentType {
    name: 'Default' | 'Override';
    ContentType: string;
    Extension?: string;
    PartName?: string;
}

export interface ExcelXMLTemplate {
    getTemplate(styleProperties?: ExcelStyle | ExcelWorksheet | ExcelColumn | ExcelRow | ExcelCell): XmlElement;
}

export interface ExcelOOXMLTemplate {
    getTemplate(config?: any, idx?: number): XmlElement;
    convertType?(type: string): string;
}

// Excel Export
export enum ExcelFactoryMode { SINGLE_SHEET, MULTI_SHEET }

export interface ColumnWidthCallbackParams {
    column: Column | null;
    index: number;
}

export interface ExcelExportParams extends ExportParams<ExcelCell[][]> {
    author?: string;
    autoConvertFormulas?: boolean;
    columnWidth?: number | ((params: ColumnWidthCallbackParams) => number);
    exportMode?: 'xlsx' | 'xml';
    fontSize?: number;
    headerRowHeight?: number;
    rowHeight?: number;
    sheetName?: string;
    sheetConfig?: ExcelSheetConfig;
    suppressTextAsCDATA?:boolean;
}

export type ExcelExportMultipleSheetParams = PackageFileParams<ExcelExportParams>;

export interface IExcelCreator {
    exportDataAsExcel(params?: ExcelExportParams): void;
    getDataAsExcel(params?: ExcelExportParams): Blob | string;
    getGridRawDataForExcel(params?: ExcelExportParams): string;

    getMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): Blob;
    exportMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): void;

    /** private methods */
    setFactoryMode(factoryMode: ExcelFactoryMode, exportMode: 'xml' | 'xlsx'): void;
    getFactoryMode(exportMode: 'xml' | 'xlsx'): ExcelFactoryMode;
}

export interface ExcelSheetConfig {
    margins?: ExcelSheetMargin;
    setup?: ExcelSheetPageSetup;
}

export interface ExcelSheetMargin {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
    header?: number;
    footer?: number;
}

export interface ExcelSheetPageSetup {
    orientation?: 'Portrait' | 'Landscape';
    pageSize?: 'Letter' | 'Letter Small' | 'Tabloid' | 'Ledger' | 'Legal' | 'Statement' | 'Executive' | 'A3' | 'A4' | 'A4 Small' | 'A5' | 'A6' | 'B4' | 'B5' | 'Folio' | 'Envelope' | 'Envelope DL' | 'Envelope C5' | 'Envelope B5' | 'Envelope C3' | 'Envelope C4' | 'Envelope C6' | 'Envelope Monarch' | 'Japanese Postcard' | 'Japanese Double Postcard';
}
