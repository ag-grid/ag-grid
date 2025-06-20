import type {
    GetRowIdParams,
    GridApi,
    GridOptions,
    RowDragCancelEvent,
    RowDragEndEvent,
    RowDragEnterEvent,
    RowDragMoveEvent,
    ValueFormatterParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    RowDragModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { getData } from './data';
import { FileCellRenderer } from './fileCellRenderer_typescript';
import { moveFiles } from './fileUtils';
import type { IFile } from './fileUtils';

/** Custom user data attached to the grid */
interface MyGridContext {
    /** The original row data before dragging started */
    rowDataDragging: IFile[] | null | undefined;
}

let gridApi: GridApi<IFile>;

ModuleRegistry.registerModules([
    RowDragModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    TreeDataModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

/** Called when row dragging start */
function onRowDragEnter(event: RowDragEnterEvent<IFile, MyGridContext>): void {
    // Store the original row data to restore it the drag is cancelled in a custom property in the context
    event.context.rowDataDragging = event.api.getGridOption('rowData');
}

/** Called both when dragging and dropping (drag end) */
function rowDragOrDrop(event: RowDragMoveEvent<IFile, MyGridContext> | RowDragEndEvent<IFile, MyGridContext>): void {
    let target = event.overNode?.data;
    const source = event.node.data;
    const rowData = event.api.getGridOption('rowData');
    if (rowData && source && source !== target) {
        const reorderOnly = event.event?.shiftKey;
        const newRowData = moveFiles(rowData, source, target, reorderOnly);
        if (newRowData !== rowData) {
            event.api.setGridOption('rowData', newRowData);
        }
    }
}

/** Called both when dragging and dropping (drag end) */
function onRowDragMove(event: RowDragMoveEvent<IFile, MyGridContext> | RowDragEndEvent<IFile, MyGridContext>): void {
    rowDragOrDrop(event);
}

/** Called when row dragging end, and the operation need to be committed */
function onRowDragEnd(event: RowDragEndEvent<IFile, MyGridContext>): void {
    rowDragOrDrop(event);
    event.api.clearFocusedCell();
    event.context.rowDataDragging = null;
}

/** Called when row dragging is cancelled, for example, ESC key is pressed */
function onRowDragCancel(event: RowDragCancelEvent<IFile, MyGridContext>): void {
    if (event.context.rowDataDragging) {
        // Restore the original row data before the drag started
        event.api.setGridOption('rowData', event.context.rowDataDragging);
        event.context.rowDataDragging = null;
    }
}

const gridOptions: GridOptions<IFile> = {
    columnDefs: [
        { field: 'dateModified' },
        {
            field: 'size',
            valueFormatter: (params: ValueFormatterParams) => (params.value ? params.value + ' MB' : ''),
        },
    ],
    autoGroupColumnDef: {
        rowDrag: true,
        headerName: 'Files',
        minWidth: 300,
        cellRendererParams: { suppressCount: true, innerRenderer: FileCellRenderer },
    },
    defaultColDef: { flex: 1 },
    treeData: true,
    groupDefaultExpanded: -1,
    rowData: getData(),
    getDataPath: (data: IFile) => data.filePath,
    getRowId: (params: GetRowIdParams) => params.data.id,
    context: { rowDataDragging: null },
    onRowDragEnter: onRowDragEnter,
    onRowDragMove: onRowDragMove,
    onRowDragEnd: onRowDragEnd,
    onRowDragCancel: onRowDragCancel,
};

// wait for the document to be loaded, otherwise
// AG Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function () {
    // lookup the container we want the Grid to use
    const eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;

    // create the grid passing in the div to use together with the columns & data we want to use
    gridApi = createGrid(eGridDiv, gridOptions);
});
