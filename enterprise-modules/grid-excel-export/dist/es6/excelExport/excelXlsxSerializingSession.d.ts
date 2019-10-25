import { Column, ExcelCell, ExcelDataType, ExcelOOXMLDataType, RowNode } from '@ag-community/grid-core';
import { ExcelXmlSerializingSession } from './excelXmlSerializingSession';
import { RowSpanningAccumulator } from "@ag-community/grid-csv-export";
export declare class ExcelXlsxSerializingSession extends ExcelXmlSerializingSession {
    private stringList;
    private stringMap;
    onNewHeaderGroupingRow(): RowSpanningAccumulator;
    onNewHeaderColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node?: RowNode) => void;
    parse(): string;
    onNewBodyColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node: RowNode) => void;
    private getStringPosition;
    protected createCell(styleId: string | undefined, type: ExcelOOXMLDataType, value: string): ExcelCell;
    protected createMergedCell(styleId: string | undefined, type: ExcelDataType | ExcelOOXMLDataType, value: string, numOfCells: number): ExcelCell;
}
