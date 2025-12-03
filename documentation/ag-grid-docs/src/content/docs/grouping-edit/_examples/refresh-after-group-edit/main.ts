import type { GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    SelectEditorModule,
    TextEditorModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { type GroupAssignment, REGION_LIST, getAssignments } from './data';

ModuleRegistry.registerModules([
    RowGroupingModule,
    ClientSideRowModelModule,
    TextEditorModule,
    TextFilterModule,
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
        },
        { field: 'owner' },
    ],
    defaultColDef: {
        sortable: true,
        resizable: true,
        filter: true,
    },
    autoGroupColumnDef: {
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
