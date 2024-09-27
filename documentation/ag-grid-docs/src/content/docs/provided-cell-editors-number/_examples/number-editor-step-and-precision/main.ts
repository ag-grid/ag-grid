import { ClientSideRowModelModule } from 'ag-grid-community';
import type { ColDef, GridApi, GridOptions, INumberCellEditorParams } from 'ag-grid-community';
import { createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const columnDefs: ColDef[] = [
    {
        headerName: 'Number Editor',
        field: 'number',
        cellEditor: 'agNumberCellEditor',
        cellEditorParams: {
            precision: 2,
            step: 0.25,
            showStepperButtons: true,
        } as INumberCellEditorParams,
    },
];

const data = Array.from(Array(20).keys()).map((val: any, index: number) => ({
    number: index,
}));

let gridApi: GridApi;

const gridOptions: GridOptions = {
    defaultColDef: {
        width: 200,
        editable: true,
    },
    columnDefs: columnDefs,
    rowData: data,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
