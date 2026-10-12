import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { AdvancedFilterModule, SetFilterModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, SetFilterModule, AdvancedFilterModule]);

let gridApi: GridApi<IOlympicData>;
let allData: IOlympicData[] = [];

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', minWidth: 180 },
        {
            field: 'country',
            filter: 'agSetColumnFilter',
            filterParams: {
                preservePreviousValues: true,
            },
            minWidth: 200,
        },
        { field: 'sport' },
        { field: 'year' },
    ],
    defaultColDef: {
        flex: 1,
    },
    enableAdvancedFilter: true,
};

function rowsOfYear(year: number) {
    return allData.filter((row) => row.year === year);
}

function showYear(year: number) {
    gridApi!.setGridOption('rowData', rowsOfYear(year));
}

function reset() {
    gridApi!.setAdvancedFilterModel(null);
    gridApi!.setGridOption('rowData', rowsOfYear(2008));
    gridApi!.doFilterAction({ action: 'clearPreservedValues' });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => {
            allData = data;
            gridApi!.setGridOption('rowData', rowsOfYear(2008));
        });
});
