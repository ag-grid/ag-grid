import {
    CellClickedEvent,
    CellDoubleClickedEvent,
    CellMouseDownEvent,
    ClientSideRowModelModule,
    EventCellRendererParams,
    GridApi,
    GridOptions,
    ModuleRegistry,
    NumberEditorModule,
    RowClickedEvent,
    RowDoubleClickedEvent,
    RowSelectionModule,
    SuppressMouseEventHandlingParams,
    TextEditorModule,
    createGrid,
} from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';

import { CustomButtonComponent } from './customButtonComponent_typescript';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CellSelectionModule,
    RowSelectionModule,
    TextEditorModule,
    NumberEditorModule,
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    rowData: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
    defaultColDef: {
        editable: true,
    },
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
        },
    ],
    onCellClicked: (e: CellClickedEvent) => {
        console.log(e.type, 'isEventHandlingSuppressed', e.isEventHandlingSuppressed);
    },
    onCellMouseDown: (e: CellMouseDownEvent) => {
        console.log(e.type, 'isEventHandlingSuppressed', e.isEventHandlingSuppressed);
    },
    onCellDoubleClicked: (e: CellDoubleClickedEvent) => {
        console.log(e.type, 'isEventHandlingSuppressed', e.isEventHandlingSuppressed);
    },
    onRowClicked: (e: RowClickedEvent) => {
        console.log(e.type, 'isEventHandlingSuppressed', e.isEventHandlingSuppressed);
    },
    onRowDoubleClicked: (e: RowDoubleClickedEvent) => {
        console.log(e.type, 'isEventHandlingSuppressed', e.isEventHandlingSuppressed);
    },
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
