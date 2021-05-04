import { ExcelStyle, ExcelWorksheet, ExcelFactoryMode } from 'ag-grid-community';
/**
 * See https://msdn.microsoft.com/en-us/library/aa140066(v=office.10).aspx
 */
export declare class ExcelXmlFactory {
    static factoryMode: ExcelFactoryMode;
    static createExcel(styles: ExcelStyle[], currentWorksheet: ExcelWorksheet): string;
    private static workbook;
    private static excelXmlHeader;
    private static stylesXmlElement;
    private static styleXmlElement;
    private static addProperty;
}
