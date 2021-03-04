import { Column, ExcelCell, ExcelStyle, ExcelXMLDataType, ExcelWorksheet, RowNode } from '@ag-grid-community/core';
import { RowSpanningAccumulator } from "@ag-grid-community/csv-export";
import { BaseExcelSerializingSession } from './baseExcelSerializingSession';
export declare class ExcelXmlSerializingSession extends BaseExcelSerializingSession<ExcelXMLDataType> {
    onNewHeaderGroupingRow(): RowSpanningAccumulator;
    protected createExcel(data: ExcelWorksheet): string;
    protected getDataTypeForValue(valueForCell: string): ExcelXMLDataType;
    protected onNewHeaderColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node: RowNode) => void;
    protected getType(type: ExcelXMLDataType, style: ExcelStyle | null, value: string | null): ExcelXMLDataType | null;
    protected createCell(styleId: string | null, type: ExcelXMLDataType, value: string): ExcelCell;
    protected createMergedCell(styleId: string | null, type: ExcelXMLDataType, value: string, numOfCells: number): ExcelCell;
}
