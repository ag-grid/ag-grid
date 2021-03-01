import { Column, ExcelCell, ExcelOOXMLDataType, ExcelStyle, ExcelWorksheet, RowNode } from '@ag-grid-community/core';
import { RowSpanningAccumulator } from "@ag-grid-community/csv-export";
import { BaseExcelSerializingSession } from './baseExcelSerializingSession';
export declare class ExcelXlsxSerializingSession extends BaseExcelSerializingSession<ExcelOOXMLDataType> {
    onNewHeaderGroupingRow(): RowSpanningAccumulator;
    protected createExcel(data: ExcelWorksheet): string;
    protected getDataTypeForValue(valueForCell: string): ExcelOOXMLDataType;
    protected onNewHeaderColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node?: RowNode) => void;
    protected getType(type: ExcelOOXMLDataType, style: ExcelStyle | null, value: string | null): ExcelOOXMLDataType | null;
    protected createCell(styleId: string | null, type: ExcelOOXMLDataType, value: string): ExcelCell;
    protected createMergedCell(styleId: string | null, type: ExcelOOXMLDataType, value: string, numOfCells: number): ExcelCell;
    private getCellValue;
}
