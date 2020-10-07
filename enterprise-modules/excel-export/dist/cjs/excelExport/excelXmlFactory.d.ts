import { BeanStub } from '@ag-grid-community/core';
import { ExcelStyle, ExcelWorksheet } from '@ag-grid-community/core';
/**
 * See https://msdn.microsoft.com/en-us/library/aa140066(v=office.10).aspx
 */
export declare class ExcelXmlFactory extends BeanStub {
    private xmlFactory;
    createExcel(styles: ExcelStyle[], worksheets: ExcelWorksheet[], sharedStrings?: string[]): string;
    private workbook;
    private excelXmlHeader;
    private stylesXmlElement;
    private styleXmlElement;
    private addProperty;
}
