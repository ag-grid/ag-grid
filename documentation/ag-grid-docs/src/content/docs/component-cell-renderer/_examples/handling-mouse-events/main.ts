import {
    ClientSideRowModelModule,
    EventCellRendererParams,
    GridApi,
    GridOptions,
    ModuleRegistry,
    RowSelectionModule,
    SuppressMouseEventHandlingParams,
    TextEditorModule,
    createGrid,
} from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';

import { CustomButtonComponent } from './customButtonComponent_typescript';

ModuleRegistry.registerModules([ClientSideRowModelModule, CellSelectionModule, RowSelectionModule, TextEditorModule]);

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
            cellRendererParams: {
                suppressMouseEventHandling: (params: SuppressMouseEventHandlingParams) => {
                    console.log('suppressMouseEventHandling', params);
                    return true;
                },
            } as EventCellRendererParams,
            editable: true,
        },
    ],
};

function toggleCellSelection() {
    const enableCellSelection = !gridApi.getGridOption('cellSelection');
    gridApi.setGridOption('cellSelection', enableCellSelection);
    document.querySelector('#enableCellSelection')!.textContent = enableCellSelection
        ? 'Disable Cell Selection'
        : 'Enable Cell Selection';
}

function toggleRowSelection() {
    const oldRowSelection = gridApi.getGridOption('rowSelection');
    gridApi.setGridOption(
        'rowSelection',
        oldRowSelection
            ? undefined
            : {
                  mode: 'multiRow',
                  enableClickSelection: true,
              }
    );
    document.querySelector('#rowSelection')!.textContent = !oldRowSelection
        ? 'Disable Row Selection'
        : 'Enable Row Selection';
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});

if (typeof window !== 'undefined') {
    // Attach external event handlers to window so they can be called from index.html
    (<any>window).toggleCellSelection = toggleCellSelection;
    (<any>window).toggleRowSelection = toggleRowSelection;
}
