import type { GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowDragModule,
    TextEditorModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { BatchEditModule, RowGroupingModule } from 'ag-grid-enterprise';

import { type WorkItem, getWorkItems } from './data';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    RowGroupingModule,
    RowDragModule,
    TextEditorModule,
    BatchEditModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const gridOptions: GridOptions<WorkItem> = {
    columnDefs: [
        { field: 'team', rowGroup: true, editable: true },
        { field: 'priority' },
        { field: 'task' },
        { field: 'owner' },
        { field: 'status' },
    ],
    defaultColDef: {
        sortable: true,
        filter: true,
    },
    autoGroupColumnDef: {
        rowDrag: true,
        headerName: 'Team',
    },
    animateRows: true,
    groupDefaultExpanded: 1,
    rowDragManaged: true,
    suppressMoveWhenRowDragging: true,
    refreshAfterGroupEdit: true,
    getRowId: ({ data }) => data.id,
    onGridReady: (params) => {
        params.api.setGridOption('rowData', getWorkItems());
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
