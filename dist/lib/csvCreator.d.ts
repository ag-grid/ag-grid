// Type definitions for ag-grid v5.0.4
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { ProcessCellForExportParams, ProcessHeaderForExportParams } from "./entities/gridOptions";
export interface CsvExportParams {
    skipHeader?: boolean;
    skipFooters?: boolean;
    skipGroups?: boolean;
    suppressQuotes?: boolean;
    fileName?: string;
    customHeader?: string;
    customFooter?: string;
    allColumns?: boolean;
    columnSeparator?: string;
    onlySelected?: boolean;
    processCellCallback?(params: ProcessCellForExportParams): void;
    processHeaderCallback?(params: ProcessHeaderForExportParams): string;
}
export declare class CsvCreator {
    private rowModel;
    private columnController;
    private valueService;
    private gridOptionsWrapper;
    exportDataAsCsv(params?: CsvExportParams): void;
    getDataAsCsv(params?: CsvExportParams): string;
    private getHeaderName(callback, column);
    private processCell(rowNode, column, value, processCellCallback);
    private createValueForGroupNode(node);
    private putInQuotes(value, suppressQuotes);
}
