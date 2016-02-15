// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import InMemoryRowController from "./rowControllers/inMemoryRowController";
import { ColumnController } from "./columnController/columnController";
import { Grid } from "./grid";
import ValueService from "./valueService";
export interface CsvExportParams {
    skipHeader?: boolean;
    skipFooters?: boolean;
    skipGroups?: boolean;
    fileName?: string;
    customHeader?: string;
    customFooter?: string;
    allColumns?: boolean;
    columnSeparator?: string;
}
export default class CsvCreator {
    private rowController;
    private columnController;
    private grid;
    private valueService;
    constructor(rowController: InMemoryRowController, columnController: ColumnController, grid: Grid, valueService: ValueService);
    exportDataAsCsv(params?: CsvExportParams): void;
    getDataAsCsv(params?: CsvExportParams): string;
    private createValueForGroupNode(node);
    private escape(value);
}
