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

import { type ExpansionPlan, getExpansionPlans } from './data';

ModuleRegistry.registerModules([
    RowGroupingModule,
    RowDragModule,
    ClientSideRowModelModule,
    TextEditorModule,
    BatchEditModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const gridOptions: GridOptions<ExpansionPlan> = {
    columnDefs: [
        { field: 'region', rowGroup: true, editable: true },
        { field: 'country', rowGroup: true, editable: true },
        { field: 'stream' },
        { field: 'milestone' },
        { field: 'lead' },
    ],
    defaultColDef: {
        sortable: true,
        filter: true,
    },
    autoGroupColumnDef: {
        headerName: 'Region / Country',
        rowDrag: true,
    },
    animateRows: true,
    groupDefaultExpanded: -1,
    enableGroupEdit: true,
    rowDragManaged: true,
    suppressMoveWhenRowDragging: true,
    refreshAfterGroupEdit: true,
    getRowId: ({ data }) => data.id,
    onGridReady: (params) => {
        params.api.setGridOption('rowData', getExpansionPlans());
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
