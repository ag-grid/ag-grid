import { Column } from "../entities/column";
import { ExportParams } from "./exportParams";
import { XmlElement } from "./iXmlFactory";
export interface ExcelStyle {
    /** The id of the Excel Style, this should match a CSS cell class. */
    id: string;
    /** Use this property to customise cell alignment properties. */
    alignment?: ExcelAlignment;
    /** Use this property to customise cell borders. */
    borders?: ExcelBorders;
    /** Use this property to specify the type of data being exported. */
    dataType?: ExcelDataType;
    /** Use this property to customise the font used in the cell. */
    font?: ExcelFont;
    /** Use this property to customise the cell background. */
    interior?: ExcelInterior;
    /** Use this property to customise the cell value as a formatted number. */
    numberFormat?: ExcelNumberFormat;
    /** Use this property to setup cell protection. */
    protection?: ExcelProtection;
    /**
     * @deprecated Legacy property
     */
    name?: string;
}
export interface ExcelAlignment {
    /**
     * Use this property to change the cell horizontal alignment.
     * Default: `Automatic`
     */
    horizontal?: 'Automatic' | 'Left' | 'Center' | 'Right' | 'Fill' | 'Justify' | 'CenterAcrossSelection' | 'Distributed' | 'JustifyDistributed';
    /**
     * Use this property to change the level of indentation in the cell.
     * Default: 0
     */
    indent?: number;
    /**
     * Use this property to change the cell reading order.
     * Default: `LeftToRight`
     */
    readingOrder?: 'RightToLeft' | 'LeftToRight' | 'Context';
    /**
     * The number of degrees between 0 and 359 to rotate the text.
     * Default: `0`
     */
    rotate?: number;
    /**
     * If set to `true`, the font size of the cell will automatically change to force the text to fit within the cell.
     * Default: `false`
     */
    shrinkToFit?: boolean;
    /**
     * Use this property to change the cell vertical alignment.
     * Default: `Automatic`
     */
    vertical?: 'Automatic' | 'Top' | 'Bottom' | 'Center' | 'Justify' | 'Distributed' | 'JustifyDistributed';
    /**
     * If set to `true`, multiline text will be displayed as multiline by Excel.
     * Default: `false`
     */
    wrapText?: boolean;
    /**
     * @deprecated Legacy property
     */
    verticalText?: boolean;
}
export interface ExcelBorders {
    /** Use to set the cell's bottom border. */
    borderBottom?: ExcelBorder;
    /** Use to set the cell's left border. */
    borderLeft?: ExcelBorder;
    /** Use to set the cell's right border. */
    borderRight?: ExcelBorder;
    /** Use to set the cell's top border. */
    borderTop?: ExcelBorder;
}
export interface ExcelBorder {
    /**
     * The color or the border.
     * Default: `black`
     */
    color?: string;
    /**
     * The style of the border.
     * Default: `None`
     */
    lineStyle?: 'None' | 'Continuous' | 'Dash' | 'Dot' | 'DashDot' | 'DashDotDot' | 'SlantDashDot' | 'Double';
    /**
     * The thickness of the border from 0 (thin) to 3 (thick).
     * Default: `0`
     */
    weight?: 0 | 1 | 2 | 3;
}
export interface ExcelFont {
    /**
     * Set to `true` to set the cell text to bold.
     * Default: `false`
     */
    bold?: boolean;
    /**
     * The color of the cell font.
     * Default: `#000000`
     */
    color?: string;
    /**
     * The family of the font to used in the cell.
     * Options: `Automatic`,`Roman`,`Swiss`,`Modern`,`Script`,`Decorative`,
     * Default: `Automatic`
     */
    family?: string;
    /**
     * The name of the font to be used in the cell.
     * Default: `Calibri`
     */
    fontName?: string;
    /**
     * Set to `true` to display the cell font as italic.
     * Default: `false`
     */
    italic?: boolean;
    /**
     * Set to `true` to add a text outline.
     * Default: `false`
     */
    outline?: boolean;
    /**
     * Set to `true` to add text shadow.
     * Default: `false`
     */
    shadow?: boolean;
    /**
     * Set this property to used a different font size other than the default.
     */
    size?: number;
    /**
     * Set to `true` to add a strikeThrough line.
     * Default: `false`
     */
    strikeThrough?: boolean;
    /**
     * Use this property to underline the cell text.
     */
    underline?: 'Single' | 'Double';
    /** Use this property to change the default font alignment. Note: This is different than setting cell vertical alignment. */
    verticalAlign?: 'Superscript' | 'Subscript';
    /**
     * @deprecated Legacy property
     */
    charSet?: number;
}
export interface ExcelInterior {
    /** Use this property to set background color patterns. */
    pattern: 'None' | 'Solid' | 'Gray75' | 'Gray50' | 'Gray25' | 'Gray125' | 'Gray0625' | 'HorzStripe' | 'VertStripe' | 'ReverseDiagStripe' | 'DiagStripe' | 'DiagCross' | 'ThickDiagCross' | 'ThinHorzStripe' | 'ThinVertStripe' | 'ThinReverseDiagStripe' | 'ThinDiagStripe' | 'ThinHorzCross' | 'ThinDiagCross';
    /** The colour to be used as a secondary colour combined with patterns. */
    color?: string;
    /** The pattern color. */
    patternColor?: string;
}
export interface ExcelNumberFormat {
    /** Use this property to provide a pattern to format a number. (eg. 10000 could become $10,000.00). */
    format: string;
}
export interface ExcelProtection {
    /**
     * Set to `false` to disable cell protection (locking)
     * Default: `true`
     */
    protected: boolean;
    /**
     * Set to `true` to hide formulas within protected cells.
     * Default: `false`
     */
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
    /** Collapsed state. */
    collapsed?: boolean;
    /** Hidden state. */
    hidden?: boolean;
    /** The height of the row. */
    height?: number;
    /** The indentation level if the current row is part of a row group. */
    outlineLevel?: number;
    /** An array of ExcelCells. */
    cells: ExcelCell[];
}
export interface ExcelCell {
    /** Cell reference. */
    ref?: string;
    /** The ExcelStyle id to be associated with the cell. */
    styleId?: string;
    /** The data that will be added to the cell. */
    data?: ExcelData;
    /**
     * The number of cells to span across (1 means span 2 columns).
     * Default: `0`
     */
    mergeAcross?: number;
    /** Collapsible ranges. */
    collapsibleRanges?: number[][];
}
export interface ExcelImagePosition {
    /** The row containing this image. This property is set automatically, don't change it unless you know what you are doing. */
    row?: number;
    /**
     * The amount of rows this image will cover.
     * Default: `1`
     *  */
    rowSpan?: number;
    /** The column containing this image. This property is set automatically, don't change it unless you know what you are doing. */
    column?: number;
    /**
     * The amount of columns this image will cover.
     * Default: `1`
     */
    colSpan?: number;
    /**
     * The amount in pixels the image should be offset horizontally.
     * Default: `0`
     */
    offsetX?: number;
    /**
     * The amount in pixels the image should be offset vertically.
     * Default: `0`
     */
    offsetY?: number;
}
export interface ExcelImage {
    /**
     * The image `id`. This field is required so the same image doesn't get imported multiple times.
     */
    id: string;
    /**
     * A base64 string that represents the image being imported.
     */
    base64: string;
    /** The type of image being exported. */
    imageType: 'jpg' | 'png' | 'gif';
    /** Alt Text for the image. */
    altText?: string;
    /**
     * If set to `true`, the image will cover the whole cell that is being imported to.
     * Default: `false`
     */
    fitCell?: boolean;
    /**
     * Set a value between 0 - 100 that will indicate the percentage of transparency of the image.
     * Default: `0`
     */
    transparency?: number;
    /**
     * Set a value between 0 - 359 that will indicate the number of degrees to rotate the image clockwise.
     * Default: `0`
     */
    rotation?: number;
    /** Set this property to select a preset that changes the appearance of the image. */
    recolor?: 'Grayscale' | 'Sepia' | 'Washout';
    /** The width of the image in pixels. If this value is not selected, `fitCell` will be automatically set to true. */
    width?: number;
    /** The height of the image in pixels. If this value is not selected, `fitCell` will be automatically set to true. */
    height?: number;
    /** Position of the image. */
    position?: ExcelImagePosition;
}
export declare type ExcelDataType = 'String' | 'Formula' | 'Number' | 'Boolean' | 'DateTime' | 'Error';
export declare type ExcelOOXMLDataType = 'str' | 's' | 'f' | 'inlineStr' | 'n' | 'b' | 'd' | 'e' | 'empty';
export interface ExcelData {
    /** The type of data being in the cell. */
    type: ExcelDataType | ExcelOOXMLDataType;
    /** The value of the cell. */
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
export interface ExcelExportParams extends ExportParams<ExcelRow[]> {
    /** The author of the exported file. Default: `"AG Grid"` */
    author?: string;
    /**
     * If set to `true`, this will try to convert any cell that starts with `=` to a formula, instead of setting the cell value as regular string that starts with `=`.
     * Default: `false`
     */
    autoConvertFormulas?: boolean;
    /**
     * Defines the default column width. If no value is present, each column will have value currently set in the application with a min value of 75px. This property can also be supplied a callback function that returns a number.
     */
    columnWidth?: number | ((params: ColumnWidthCallbackParams) => number);
    /**
     * For backwards compatibility, this property could be set to `xml`, which will export an Excel Spreadsheet compatible with old Office versions (prior to Office 2007). Setting this to `xml` is not recommended as some features will not work in legacy mode.
     * Default: `xlsx`
     */
    exportMode?: 'xlsx' | 'xml';
    /**
     * The default value for the font size of the Excel document.
     * Default: `11`
     */
    fontSize?: number;
    /**
     * The height in pixels of header rows. Defaults to Excel default value. This property can also be supplied a callback function that returns a number.
     */
    headerRowHeight?: number | ((params: RowHeightCallbackParams) => number);
    /**
     * The height in pixels of all rows. Defaults to Excel default value. This property can also be supplied a callback function that returns a number.
     */
    rowHeight?: number | ((params: RowHeightCallbackParams) => number);
    /**
     * The name of the sheet in Excel where the grid will be exported. There is a max limit of 31 characters.
     * Default: `ag-grid`
     */
    sheetName?: string;
    /** The Excel document page margins. Relevant for printing. */
    margins?: ExcelSheetMargin;
    /** Allows you to setup the page orientation and size. */
    pageSetup?: ExcelSheetPageSetup;
    /** The configuration for header and footers. */
    headerFooterConfig?: ExcelHeaderFooterConfig;
    /**
     * If `true`, text content will be encoded with XML character entities like `&amp;lt;` and `&amp;gt;`. This is only relevant when `exportMode='xml'`.
     * Default: `false`
     */
    suppressTextAsCDATA?: boolean;
    /**
     * The mimeType of the Excel file. Note that this defaults to `application/vnd.ms-excel` if exportMode is `xml`.
     * Default: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
     */
    mimeType?: string;
    /** Use to export an image for the gridCell in question. */
    addImageToCell?: (rowIndex: number, column: Column, value: string) => {
        image: ExcelImage;
        value?: string;
    } | undefined;
}
export interface ExcelExportMultipleSheetParams {
    /**
     * The author of the exported file.
     * Default: `AG Grid`
     */
    author?: string;
    /**
     * Array of strings containing the raw data for Excel workbook sheets.
     * This property is only used when exporting to multiple sheets using `api.exportMultipleSheetsAsExcel()` and the data for each sheet is obtained by calling `api.getSheetDataForExcel()`.
     */
    data: string[];
    /**
     * String to use as the file name.
     * Default: `export.xlsx`
     */
    fileName?: string;
    /**
     * The default value for the font size of the Excel document.
     * Default: `11`
     */
    fontSize?: number;
    /**
     * The mimeType of the Excel file.
     * Default: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
     */
    mimeType?: string;
}
export interface ExcelHeaderFooterConfig {
    /** The configuration for header and footer on every page. */
    all?: ExcelHeaderFooter;
    /** The configuration for header and footer on the first page only. */
    first?: ExcelHeaderFooter;
    /** The configuration for header and footer on even numbered pages only. */
    even?: ExcelHeaderFooter;
}
export interface ExcelHeaderFooter {
    /** An array of maximum 3 items (`Left`, `Center`, `Right`), containing header configurations. */
    header?: ExcelHeaderFooterContent[];
    /** An array of maximum 3 items (`Left`, `Center`, `Right`), containing footer configurations. */
    footer?: ExcelHeaderFooterContent[];
}
export interface ExcelHeaderFooterContent {
    /** The value of the text to be included in the header. */
    value: string;
    /**
     * Configures where the text should be added: `Left`, `Center` or `Right`.
     * Default: `Left`
     */
    position?: 'Left' | 'Center' | 'Right';
    /** The font style of the header/footer value. */
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
    /**
     * The sheet top margin.
     * Default: `0.75`
     */
    top?: number;
    /**
     * The sheet right margin.
     * Default: `0.7`
     */
    right?: number;
    /**
     * The sheet bottom margin.
     * Default: `0.75`
     */
    bottom?: number;
    /**
     * The sheet left margin.
     * Default: `0.7`
     */
    left?: number;
    /**
     * The sheet header margin.
     * Default: `0.3`
     */
    header?: number;
    /**
     * The sheet footer margin.
     * Default: `0.3`
     */
    footer?: number;
}
export interface ExcelSheetPageSetup {
    /**
     * Use this property to change the print orientation.
     * Default: `Portrait`
     */
    orientation?: 'Portrait' | 'Landscape';
    /**
     * Use this property to set the sheet size.
     * Default: `Letter`
     */
    pageSize?: 'Letter' | 'Letter Small' | 'Tabloid' | 'Ledger' | 'Legal' | 'Statement' | 'Executive' | 'A3' | 'A4' | 'A4 Small' | 'A5' | 'A6' | 'B4' | 'B5' | 'Folio' | 'Envelope' | 'Envelope DL' | 'Envelope C5' | 'Envelope B5' | 'Envelope C3' | 'Envelope C4' | 'Envelope C6' | 'Envelope Monarch' | 'Japanese Postcard' | 'Japanese Double Postcard';
}
