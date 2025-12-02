import type { GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    SelectEditorModule,
    TextEditorModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { type GroupAssignment, REGION_LIST, getAssignments } from './data';

ModuleRegistry.registerModules([
    RowGroupingModule,
    ClientSideRowModelModule,
    TextEditorModule,
    SelectEditorModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const gridOptions: GridOptions<GroupAssignment> = {
    columnDefs: [
        {
            field: 'region',
            headerName: 'Region',
            rowGroup: true,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: REGION_LIST },
            minWidth: 140,
        },
        { field: 'pod', minWidth: 140 },
        { field: 'owner', minWidth: 140 },
        { headerName: 'Backlog', field: 'backlog', width: 130 },
        { field: 'focus', flex: 1, editable: true },
    ],
    defaultColDef: {
        sortable: true,
        resizable: true,
        filter: true,
    },
    autoGroupColumnDef: {
        headerName: 'Region / Pod',
        minWidth: 220,
    },
    rowData: getAssignments(),
    refreshAfterGroupEdit: true,
    groupDefaultExpanded: -1,
    animateRows: true,
    getRowId: ({ data }) => data.id,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
