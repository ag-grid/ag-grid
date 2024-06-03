import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridApi, GridOptions, INumberCellEditorParams, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';

ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule]);

const columnDefs: ColDef[] = [
    {
        headerName: 'Number Editor',
        field: 'number',
        cellEditor: 'agNumberCellEditor',
        cellEditorParams: {
            preventStepping: true,
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
