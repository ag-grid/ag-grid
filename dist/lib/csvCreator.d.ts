// Type definitions for ag-grid v4.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { ProcessCellForExportParams } from "./entities/gridOptions";
export interface CsvExportParams {
    skipHeader?: boolean;
    skipFooters?: boolean;
    skipGroups?: boolean;
    fileName?: string;
    customHeader?: string;
    customFooter?: string;
    allColumns?: boolean;
    columnSeparator?: string;
    onlySelected?: boolean;
    processCellCallback?(params: ProcessCellForExportParams): void;
}
export declare class CsvCreator {
    private rowModel;
    private columnController;
    private valueService;
    private gridOptionsWrapper;
    exportDataAsCsv(params?: CsvExportParams): void;
    getDataAsCsv(params?: CsvExportParams): string;
    private processCell(rowNode, column, value, processCellCallback);
    private createValueForGroupNode(node);
    private escape(value);
}
