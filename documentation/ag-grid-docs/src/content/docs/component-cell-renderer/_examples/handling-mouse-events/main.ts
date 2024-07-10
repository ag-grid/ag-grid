import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';

import { CustomButtonComponent } from './customButtonComponent_typescript';

ModuleRegistry.registerModules([ClientSideRowModelModule, RangeSelectionModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    rowData: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
    columnDefs: [
        {
            field: 'id',
        },
        {
            colId: 'customButton',
            headerName: 'Button',
            cellRenderer: CustomButtonComponent,
            editable: true,
        },
    ],
};

function toggleRangeSelection() {
    const enableRangeSelection = !gridApi.getGridOption('enableRangeSelection');
    gridApi.setGridOption('enableRangeSelection', enableRangeSelection);
    document.querySelector('#enableRangeSelection')!.textContent = enableRangeSelection
        ? 'Disable Range Selection'
        : 'Enable Range Selection';
}

function toggleRowSelection() {
    const rowSelection = gridApi.getGridOption('rowSelection') === 'multiple' ? undefined : 'multiple';
    gridApi.setGridOption('rowSelection', rowSelection);
    document.querySelector('#rowSelection')!.textContent =
        rowSelection === 'multiple' ? 'Disable Row Selection' : 'Enable Row Selection';
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});

if (typeof window !== 'undefined') {
    // Attach external event handlers to window so they can be called from index.html
    (<any>window).toggleRangeSelection = toggleRangeSelection;
    (<any>window).toggleRowSelection = toggleRowSelection;
}
