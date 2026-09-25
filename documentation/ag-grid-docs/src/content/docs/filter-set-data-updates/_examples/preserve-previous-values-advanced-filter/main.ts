import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { AdvancedFilterModule, SetFilterModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, SetFilterModule, AdvancedFilterModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        {
            headerName: 'Set Filter Column',
            field: 'col1',
            filter: 'agSetColumnFilter',
            filterParams: {
                preservePreviousValues: true,
            },
            minWidth: 250,
        },
    ],
    enableAdvancedFilter: true,
    rowData: getRowData(),
};

function getRowData() {
    return [{ col1: 'A' }, { col1: 'A' }, { col1: 'B' }, { col1: 'C' }];
}

function updateOne() {
    gridApi!.setGridOption('rowData', [{ col1: 'A' }, { col1: 'A' }, { col1: 'D' }]);
}

function updateTwo() {
    gridApi!.setGridOption('rowData', [{ col1: 'A' }, { col1: 'B' }, { col1: 'C' }, { col1: 'D' }]);
}

function reset() {
    gridApi!.setAdvancedFilterModel(null);
    gridApi!.setGridOption('rowData', getRowData());
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
