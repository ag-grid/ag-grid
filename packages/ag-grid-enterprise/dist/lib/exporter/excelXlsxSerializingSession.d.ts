// ag-grid-enterprise v19.1.3
import { Column, ExcelCell, ExcelDataType, ExcelOOXMLDataType, RowNode, RowSpanningAccumulator } from 'ag-grid-community';
import { ExcelXmlSerializingSession } from './excelXmlSerializingSession';
export declare class ExcelXlsxSerializingSession extends ExcelXmlSerializingSession {
    private stringList;
    onNewHeaderGroupingRow(): RowSpanningAccumulator;
    onNewHeaderColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node?: RowNode) => void;
    parse(): string;
    onNewBodyColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node?: RowNode) => void;
    private getStringPosition;
    protected createCell(styleId: string, type: ExcelOOXMLDataType, value: string): ExcelCell;
    protected createMergedCell(styleId: string, type: ExcelDataType | ExcelOOXMLDataType, value: string, numOfCells: number): ExcelCell;
}
//# sourceMappingURL=excelXlsxSerializingSession.d.ts.map