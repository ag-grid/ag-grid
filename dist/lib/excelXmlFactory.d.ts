// ag-grid-enterprise v8.0.0
/**
 * See https://msdn.microsoft.com/en-us/library/aa140066(v=office.10).aspx
 */
export declare class ExcelXmlFactory {
    private xmlFactory;
    createExcelXml(styles: ExcelStyle[], worksheets: ExcelWorksheet[]): string;
    private workbook(documentProperties, excelWorkbook, styles, worksheets);
    private excelXmlHeader();
    private stylesXmlElement(styles);
    private styleXmlElement(style);
    private worksheetXmlElement(worksheet);
    private columnXmlElement(column);
    private rowXmlElement(row);
    private rowCellXmlElement(cell);
    private excelWorkbook();
    private documentProperties();
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
    width: number;
}
export interface ExcelRow {
    cells: ExcelCell[];
}
export interface ExcelCell {
    styleId: string;
    data: ExcelData;
    mergeAcross?: number;
}
export interface ExcelData {
    type: ExcelDataType;
    value: string;
}
export declare enum ExcelDataType {
    String = 0,
    Number = 1,
}
export interface ExcelStyle {
    id?: string;
    name?: string;
    alignment?: ExcelAlignment;
    borders?: ExcelBorders;
    font?: ExcelFont;
    interior?: ExcelInterior;
    numberFormat?: ExcelNumberFormat;
    protection?: ExcelProtection;
}
export interface ExcelProtection {
    protected: boolean;
    hideFormula: boolean;
}
export interface ExcelNumberFormat {
    format: string;
}
export interface ExcelAlignment {
    vertical: string;
    indent: number;
    horizontal: string;
    readingOrder: string;
    rotate: number;
    shrinkToFit: boolean;
    verticalText: boolean;
    wrapText: boolean;
}
export interface ExcelBorders {
    borderBottom: ExcelBorder;
    borderLeft: ExcelBorder;
    borderTop: ExcelBorder;
    borderRight: ExcelBorder;
}
export interface ExcelBorder {
    lineStyle: string;
    weight: number;
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
    underline: string;
    verticalAlign: string;
    charSet: number;
    family: string;
}
export interface ExcelInterior {
    color: string;
    pattern: string;
    patternColor: string;
}
