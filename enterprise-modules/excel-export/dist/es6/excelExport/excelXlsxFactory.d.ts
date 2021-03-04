import { ExcelFactoryMode } from '@ag-grid-community/core';
import { ExcelStyle, ExcelWorksheet } from '@ag-grid-community/core';
/**
 * See https://www.ecma-international.org/news/TC45_current_work/OpenXML%20White%20Paper.pdf
 */
export declare class ExcelXlsxFactory {
    private static sharedStrings;
    private static sheetNames;
    static factoryMode: ExcelFactoryMode;
    static createExcel(styles: ExcelStyle[], worksheet: ExcelWorksheet): string;
    private static addSheetName;
    static getStringPosition(str: string): number;
    static resetFactory(): void;
    static createWorkbook(): string;
    static createStylesheet(defaultFontSize: number): string;
    static createSharedStrings(): string;
    static createCore(author: string): string;
    static createContentTypes(sheetLen: number): string;
    static createRels(): string;
    static createTheme(): string;
    static createWorkbookRels(sheetLen: number): string;
    private static createXmlPart;
    private static createWorksheet;
}
