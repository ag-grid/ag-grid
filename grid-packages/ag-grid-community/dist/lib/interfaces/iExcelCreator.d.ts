import { Column } from "../entities/column";
import { ExportParams } from "./exportParams";
import { XmlElement } from "./iXmlFactory";
export interface ExcelStyle {
    id: string;
    alignment?: ExcelAlignment;
    borders?: ExcelBorders;
    dataType?: ExcelDataType;
    font?: ExcelFont;
    interior?: ExcelInterior;
    numberFormat?: ExcelNumberFormat;
    protection?: ExcelProtection;
    /**
     * @deprecated Legacy property
     */
    name?: string;
}
export interface ExcelAlignment {
    horizontal?: 'Automatic' | 'Left' | 'Center' | 'Right' | 'Fill' | 'Justify' | 'CenterAcrossSelection' | 'Distributed' | 'JustifyDistributed';
    indent?: number;
    readingOrder?: 'RightToLeft' | 'LeftToRight' | 'Context';
    rotate?: number;
    shrinkToFit?: boolean;
    vertical?: 'Automatic' | 'Top' | 'Bottom' | 'Center' | 'Justify' | 'Distributed' | 'JustifyDistributed';
    wrapText?: boolean;
    /**
     * @deprecated Legacy property
     */
    verticalText?: boolean;
}
export interface ExcelBorders {
    borderBottom?: ExcelBorder;
    borderLeft?: ExcelBorder;
    borderRight?: ExcelBorder;
    borderTop?: ExcelBorder;
}
export interface ExcelBorder {
    color?: string;
    lineStyle?: 'None' | 'Continuous' | 'Dash' | 'Dot' | 'DashDot' | 'DashDotDot' | 'SlantDashDot' | 'Double';
    weight?: 0 | 1 | 2 | 3;
}
export interface ExcelFont {
    bold?: boolean;
    color?: string;
    family?: string;
    fontName?: string;
    italic?: boolean;
    outline?: boolean;
    shadow?: boolean;
    size?: number;
    strikeThrough?: boolean;
    underline?: 'Single' | 'Double';
    verticalAlign?: 'Superscript' | 'Subscript';
    /**
     * @deprecated Legacy property
     */
    charSet?: number;
}
export interface ExcelInterior {
    pattern: 'None' | 'Solid' | 'Gray75' | 'Gray50' | 'Gray25' | 'Gray125' | 'Gray0625' | 'HorzStripe' | 'VertStripe' | 'ReverseDiagStripe' | 'DiagStripe' | 'DiagCross' | 'ThickDiagCross' | 'ThinHorzStripe' | 'ThinVertStripe' | 'ThinReverseDiagStripe' | 'ThinDiagStripe' | 'ThinHorzCross' | 'ThinDiagCross';
    color?: string;
    patternColor?: string;
}
export interface ExcelNumberFormat {
    format: string;
}
export interface ExcelProtection {
    protected: boolean;
    hideFormula: boolean;
}
export interface ExcelWorksheet {
    name: string;
    table: ExcelTable;
}
export interface ExcelTable {
    columns: ExcelColumn[];
    rows: ExcelRow[];
}
export interface ExcelColumn {
    min?: number;
    max?: number;
    outlineLevel?: number;
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
    collapsibleRanges?: number[][];
}
export interface ExcelImage {
    id: string;
    base64: string;
    imageType: 'jpg' | 'png' | 'gif';
    altText?: string;
    fitCell?: boolean;
    transparency?: number;
    rotation?: number;
    recolor?: 'Grayscale' | 'Sepia' | 'Washout';
    width?: number;
    height?: number;
    position?: {
        row?: number;
        rowSpan?: number;
        column?: number;
        colSpan?: number;
        offsetX?: number;
        offsetY?: number;
    };
}
export declare type ExcelDataType = 'String' | 'Formula' | 'Number' | 'Boolean' | 'DateTime' | 'Error';
export declare type ExcelOOXMLDataType = 'str' | 's' | 'f' | 'inlineStr' | 'n' | 'b' | 'd' | 'e' | 'empty';
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
    getTemplate(config?: any, idx?: number, currentSheet?: number): XmlElement;
    convertType?(type: string): string;
}
export declare enum ExcelFactoryMode {
    SINGLE_SHEET = 0,
    MULTI_SHEET = 1
}
export interface ColumnWidthCallbackParams {
    column: Column | null;
    index: number;
}
export interface RowHeightCallbackParams {
    rowIndex: number;
}
export interface ExcelExportParams extends ExportParams<ExcelCell[][]> {
    author?: string;
    autoConvertFormulas?: boolean;
    columnWidth?: number | ((params: ColumnWidthCallbackParams) => number);
    exportMode?: 'xlsx' | 'xml';
    fontSize?: number;
    headerRowHeight?: number | ((params: RowHeightCallbackParams) => number);
    rowHeight?: number | ((params: RowHeightCallbackParams) => number);
    sheetName?: string;
    margins?: ExcelSheetMargin;
    pageSetup?: ExcelSheetPageSetup;
    headerFooterConfig?: ExcelHeaderFooterConfig;
    suppressTextAsCDATA?: boolean;
    mimeType?: string;
    /** Use to export an image for the gridCell in question. */
    addImageToCell?: (rowIndex: number, column: Column, value: string) => {
        image: ExcelImage;
        value?: string;
    } | undefined;
}
export interface ExcelExportMultipleSheetParams {
    author?: string;
    data: string[];
    fileName?: string;
    fontSize?: number;
    mimeType?: string;
}
export interface ExcelHeaderFooterConfig {
    all?: ExcelHeaderFooter;
    first?: ExcelHeaderFooter;
    even?: ExcelHeaderFooter;
}
export interface ExcelHeaderFooter {
    header?: ExcelHeaderFooterContent[];
    footer?: ExcelHeaderFooterContent[];
}
export interface ExcelHeaderFooterContent {
    value: string;
    position?: 'Left' | 'Center' | 'Right';
    font?: ExcelFont;
}
export interface IExcelCreator {
    exportDataAsExcel(params?: ExcelExportParams): void;
    getDataAsExcel(params?: ExcelExportParams): Blob | string | undefined;
    getSheetDataForExcel(params?: ExcelExportParams): string;
    getMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): Blob | undefined;
    exportMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): void;
    /** private methods */
    setFactoryMode(factoryMode: ExcelFactoryMode, exportMode: 'xml' | 'xlsx'): void;
    getFactoryMode(exportMode: 'xml' | 'xlsx'): ExcelFactoryMode;
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
