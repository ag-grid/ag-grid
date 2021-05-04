import { Column, ExcelCell, ExcelImage, ExcelOOXMLDataType, ExcelStyle, ExcelWorksheet } from 'ag-grid-community';
import { BaseExcelSerializingSession } from './baseExcelSerializingSession';
export declare class ExcelXlsxSerializingSession extends BaseExcelSerializingSession<ExcelOOXMLDataType> {
    protected createExcel(data: ExcelWorksheet): string;
    protected getDataTypeForValue(valueForCell?: string): ExcelOOXMLDataType;
    protected getType(type: ExcelOOXMLDataType, style: ExcelStyle | null, value: string | null): ExcelOOXMLDataType | null;
    protected addImage(rowIndex: number, column: Column, value: string): {
        image: ExcelImage;
        value?: string;
    } | undefined;
    protected createCell(styleId: string | null, type: ExcelOOXMLDataType, value: string): ExcelCell;
    protected createMergedCell(styleId: string | null, type: ExcelOOXMLDataType, value: string, numOfCells: number): ExcelCell;
    private getCellValue;
}
