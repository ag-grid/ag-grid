import type { CsvCustomContent } from 'ag-grid-community';
import type { CsvSerializingParams, RowAccumulator, RowSpanningAccumulator } from '../interfaces';
import { BaseGridSerializingSession } from './baseGridSerializingSession';
export declare class CsvSerializingSession extends BaseGridSerializingSession<CsvCustomContent> {
    private isFirstLine;
    private result;
    private suppressQuotes;
    private columnSeparator;
    constructor(config: CsvSerializingParams);
    addCustomContent(content: CsvCustomContent): void;
    onNewHeaderGroupingRow(): RowSpanningAccumulator;
    private onNewHeaderGroupingRowColumn;
    private appendEmptyCells;
    onNewHeaderRow(): RowAccumulator;
    private onNewHeaderRowColumn;
    onNewBodyRow(): RowAccumulator;
    private onNewBodyRowColumn;
    private putInQuotes;
    parse(): string;
    private beginNewLine;
}
