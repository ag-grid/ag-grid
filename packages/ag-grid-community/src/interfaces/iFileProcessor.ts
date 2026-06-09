import type { AgGridCommon } from './iCommon';

export interface ProcessFileInputParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** The files received via drag-and-drop or file browser on the File Input Overlay. */
    files: File[];
    /** Call with parsed row data to load it into the grid. */
    success(rowData: TData[]): void;
    /** Call to show the error state in the overlay. Optionally provide a custom `errorMessage` to be displayed in the File Input Overlay. */
    fail(errorMessage?: string): void;
}
