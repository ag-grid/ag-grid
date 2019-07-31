// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ExportParams } from "../exporter/exportParams";
import { XmlElement } from '../exporter/xmlFactory';
export interface ExcelWorksheet {
    name: string;
    table: ExcelTable;
}
export interface ExcelTable {
    columns: ExcelColumn[];
    rows: ExcelRow[];
}
export interface ExcelColumn {
    min: number;
    max: number;
    width: number;
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
export interface ExcelData {
    type: ExcelDataType | ExcelOOXMLDataType;
    value: string | null;
}
export declare type ExcelDataType = 'String' | "Number" | "Boolean" | "DateTime" | "Error";
export interface ExcelExportParams extends ExportParams<ExcelCell[][]> {
    sheetName?: string;
    suppressTextAsCDATA?: boolean;
    exportMode?: "xlsx" | "xml";
    rowHeight?: number;
    headerRowHeight?: number;
}
export interface IExcelCreator {
    exportDataAsExcel(params?: ExcelExportParams): void;
    getDataAsExcelXml(params?: ExcelExportParams): string;
}
export interface ExcelStyle {
    id: string;
    name?: string;
    alignment: ExcelAlignment;
    borders: ExcelBorders;
    font: ExcelFont;
    interior: ExcelInterior;
    numberFormat: ExcelNumberFormat;
    protection: ExcelProtection;
    dataType?: string;
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
export interface ExcelXMLTemplate {
    getTemplate(styleProperties?: ExcelStyle | ExcelWorksheet | ExcelColumn | ExcelRow | ExcelCell): XmlElement;
}
export interface ExcelContentType {
    name: 'Default' | 'Override';
    ContentType: string;
    Extension?: string;
    PartName?: string;
}
export declare type ExcelOOXMLDataType = 'str' | 's' | 'inlineStr' | 'n' | 'b' | 'd' | 'e' | 'empty';
export interface ExcelOOXMLTemplate {
    getTemplate(config?: any, idx?: number): XmlElement;
    convertType?(type: string): string;
}
export interface ExcelRelationship {
    Id: string;
    Type: string;
    Target: string;
}
