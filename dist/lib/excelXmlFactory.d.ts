// ag-grid-enterprise v16.0.1
import { ExcelStyle, ExcelWorksheet } from 'ag-grid/main';
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
