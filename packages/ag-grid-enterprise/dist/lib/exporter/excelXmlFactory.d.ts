// ag-grid-enterprise v19.0.0
import { ExcelStyle, ExcelWorksheet } from 'ag-grid-community';
/**
 * See https://msdn.microsoft.com/en-us/library/aa140066(v=office.10).aspx
 */
export declare class ExcelXmlFactory {
    private xmlFactory;
    createExcelXml(styles: ExcelStyle[], worksheets: ExcelWorksheet[]): string;
    private workbook;
    private excelXmlHeader;
    private stylesXmlElement;
    private styleXmlElement;
    private worksheetXmlElement;
    private columnXmlElement;
    private rowXmlElement;
    private rowCellXmlElement;
    private excelWorkbook;
    private documentProperties;
}
