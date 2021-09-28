import { ExcelCell, ExcelStyle, ExcelDataType, ExcelWorksheet } from 'ag-grid-community';
import { BaseExcelSerializingSession } from './baseExcelSerializingSession';
export declare class ExcelXmlSerializingSession extends BaseExcelSerializingSession<ExcelDataType> {
    protected createExcel(data: ExcelWorksheet): string;
    protected getDataTypeForValue(valueForCell?: string): ExcelDataType;
    protected getType(type: ExcelDataType, style: ExcelStyle | null, value: string | null): ExcelDataType | null;
    protected addImage(): undefined;
    protected createCell(styleId: string | null, type: ExcelDataType, value: string): ExcelCell;
    private getValueTransformed;
    protected createMergedCell(styleId: string | null, type: ExcelDataType, value: string, numOfCells: number): ExcelCell;
}
