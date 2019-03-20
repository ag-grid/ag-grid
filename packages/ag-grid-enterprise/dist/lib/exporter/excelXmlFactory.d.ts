// ag-grid-enterprise v20.2.0
import { ExcelStyle, ExcelWorksheet } from 'ag-grid-community';
/**
 * See https://msdn.microsoft.com/en-us/library/aa140066(v=office.10).aspx
 */
export declare class ExcelXmlFactory {
    private xmlFactory;
    createExcel(styles: ExcelStyle[], worksheets: ExcelWorksheet[], sharedStrings?: string[]): string;
    private workbook;
    private excelXmlHeader;
    private stylesXmlElement;
    private styleXmlElement;
    private addProperty;
}
