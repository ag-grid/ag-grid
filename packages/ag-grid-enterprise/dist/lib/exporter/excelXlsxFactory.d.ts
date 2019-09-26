// ag-grid-enterprise v21.2.2
import { ExcelStyle, ExcelWorksheet } from 'ag-grid-community';
/**
 * See https://www.ecma-international.org/news/TC45_current_work/OpenXML%20White%20Paper.pdf
 */
export declare class ExcelXlsxFactory {
    private xmlFactory;
    private sharedStrings;
    private sheetNames;
    createSharedStrings(): string;
    private createXmlPart;
    createExcel(styles: ExcelStyle[], worksheets: ExcelWorksheet[], sharedStrings?: string[]): string;
    createCore(): string;
    createContentTypes(): string;
    createRels(): string;
    createStylesheet(): string;
    createTheme(): string;
    createWorkbook(): string;
    createWorkbookRels(): string;
    createWorksheet(worksheets: ExcelWorksheet[]): string;
}
