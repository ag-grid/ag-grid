import { ExcelFactoryMode } from '@ag-grid-community/core';
import { ExcelStyle, ExcelWorksheet } from '@ag-grid-community/core';
/**
 * See https://msdn.microsoft.com/en-us/library/aa140066(v=office.10).aspx
 */
export declare class ExcelXmlFactory {
    static factoryMode: ExcelFactoryMode;
    static createExcel(styles: ExcelStyle[], worksheet: ExcelWorksheet, sharedStrings?: string[]): string;
    private static workbook;
    private static excelXmlHeader;
    private static stylesXmlElement;
    private static styleXmlElement;
    private static addProperty;
}
