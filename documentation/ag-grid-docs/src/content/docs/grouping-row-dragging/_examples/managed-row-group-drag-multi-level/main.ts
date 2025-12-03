import { get } from 'http';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    RowDragModule,
    RowSelectionModule,
    TextEditorModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { BatchEditModule, RowGroupingModule } from 'ag-grid-enterprise';

import { type IAthlete, getAthletesData } from './data';

let gridApi: GridApi<IAthlete>;

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    RowGroupingModule,
    RowDragModule,
    RowSelectionModule,
    TextEditorModule,
    NumberEditorModule,
    BatchEditModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const gridOptions: GridOptions<IAthlete> = {
    columnDefs: [
        { field: 'country', width: 120, rowGroup: true, editable: true },
        { field: 'year', width: 90, rowGroup: true, editable: true },
        { field: 'athlete', minWidth: 150 },
        { field: 'age', minWidth: 50, filter: 'agNumberColumnFilter' },
        { field: 'date', width: 110 },
        { field: 'sport', width: 110 },
        { field: 'gold', width: 110 },
        { field: 'silver', width: 110 },
        { field: 'bronze', width: 110 },
    ],
    defaultColDef: {
        sortable: true,
        filter: true,
    },
    autoGroupColumnDef: {
        headerName: 'Region / Country',
        rowDrag: true,
        width: 250,
    },
    animateRows: true,
    groupDefaultExpanded: -1,
    enableGroupEdit: true,
    rowDragManaged: true,
    suppressMoveWhenRowDragging: true,
    refreshAfterGroupEdit: true,
    rowDragMultiRow: true,
    rowSelection: { mode: 'multiRow', headerCheckbox: false },
    getRowId: ({ data }) => data.id,
    rowData: getAthletesData(),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
