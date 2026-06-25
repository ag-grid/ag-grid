import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const columnDefs: ColDef[] = [
    {
        headerName: 'Athlete Details',
        children: [
            { field: 'athlete' },
            {
                headerName: 'Meta Data',
                columnGroupShow: 'open',
                children: [{ field: 'country' }, { field: 'sport' }],
            },
        ],
    },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    defaultColDef: {
        flex: 1,
    },
    columnDefs: columnDefs,
};

function toggleOption() {
    const isChecked = document.querySelector<HTMLInputElement>('#hidePaddedHeaderRows')!.checked;
    gridApi.setGridOption('hidePaddedHeaderRows', isChecked);
}
// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data) => gridApi!.setGridOption('rowData', data));
});
