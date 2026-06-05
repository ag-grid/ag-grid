import type { AgGridCommon } from './iCommon';

export interface IFileProcessorParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** The files received via drag-and-drop or file browser. */
    files: File[];
    /** Call with parsed row data to load it into the grid. */
    success(rowData: TData[]): void;
    /** Call to show the error state in the overlay. Uses the `fileInputProcessingFailed` locale by default. */
    fail(errorMessage?: string): void;
}

export interface IFileProcessor<TData = any> {
    /** Called when files are dropped or selected via the file input overlay. */
    processFiles(params: IFileProcessorParams<TData>): void;
}
