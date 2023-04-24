import { Column, ExcelFactoryMode, ExcelHeaderFooterConfig, ExcelImage, ExcelSheetMargin, ExcelSheetPageSetup, ExcelStyle, ExcelWorksheet, RowHeightCallbackParams } from 'ag-grid-community';
import { ImageIdMap, ExcelCalculatedImage } from './assets/excelInterfaces';
/**
 * See https://www.ecma-international.org/news/TC45_current_work/OpenXML%20White%20Paper.pdf
 */
export declare class ExcelXlsxFactory {
    private static sharedStrings;
    private static sheetNames;
    /** Maps images to sheet */
    static images: Map<string, {
        sheetId: number;
        image: ExcelCalculatedImage[];
    }[]>;
    /** Maps sheets to images */
    static worksheetImages: Map<number, ExcelCalculatedImage[]>;
    /** Maps all workbook images to a global Id */
    static workbookImageIds: ImageIdMap;
    /** Maps all sheet images to unique Ids */
    static worksheetImageIds: Map<number, ImageIdMap>;
    static factoryMode: ExcelFactoryMode;
    static createExcel(styles: ExcelStyle[], worksheet: ExcelWorksheet, margins?: ExcelSheetMargin, pageSetup?: ExcelSheetPageSetup, headerFooterConfig?: ExcelHeaderFooterConfig): string;
    static buildImageMap(image: ExcelImage, rowIndex: number, col: Column, columnsToExport: Column[], rowHeight?: number | ((params: RowHeightCallbackParams) => number)): void;
    private static buildSheetImageMap;
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
    static createDrawing(sheetIndex: number): string;
    static createDrawingRel(sheetIndex: number): string;
    static createWorksheetDrawingRel(currentRelationIndex: number): string;
    private static createWorksheet;
}
