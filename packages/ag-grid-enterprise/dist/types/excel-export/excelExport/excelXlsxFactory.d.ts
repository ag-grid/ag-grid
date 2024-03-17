import { Column, ExcelFactoryMode, ExcelImage, ExcelStyle, ExcelWorksheet, RowHeightCallbackParams } from 'ag-grid-community';
import { ImageIdMap, ExcelCalculatedImage, ExcelDataTable } from './assets/excelInterfaces';
import { ExcelGridSerializingParams } from './excelSerializingSession';
/**
 * See links for more info on the Office Open XML format being used:
 * https://www.ecma-international.org/wp-content/uploads/Office-Open-XML-White-Paper.pdf
 * https://ecma-international.org/publications-and-standards/standards/ecma-376/
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
    /** Maps all sheet tables to unique Ids */
    static worksheetDataTables: Map<number, ExcelDataTable>;
    /** Default name to be used for tables when no name is provided */
    static defaultTableDisplayName: string;
    static factoryMode: ExcelFactoryMode;
    static createExcel(styles: ExcelStyle[], worksheet: ExcelWorksheet, config: ExcelGridSerializingParams): string;
    private static showExcelTableNonCompatibleFeaturesWarning;
    static getTableNameFromIndex(idx: number): string;
    static getTableRelIdFromIndex(idx: number): string;
    static getSanitizedTableName(name: string): string;
    static addTableToSheet(sheetIndex: number, table: ExcelDataTable): void;
    static buildImageMap(image: ExcelImage, rowIndex: number, col: Column, columnsToExport: Column[], rowHeight?: number | ((params: RowHeightCallbackParams) => number)): void;
    private static processTableConfig;
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
    static createTable(dataTable: ExcelDataTable, index?: number): string;
    static createWorkbookRels(sheetLen: number): string;
    static createDrawing(sheetIndex: number): string;
    static createDrawingRel(sheetIndex: number): string;
    static createWorksheetDrawingRel(currentRelationIndex: number): string;
    static createWorksheetTableRel(currentRelationIndex: number): string;
    static createRelationships({ drawingIndex, tableIndex, }?: {
        drawingIndex?: number;
        tableIndex?: number;
    }): string;
    private static createWorksheet;
}
