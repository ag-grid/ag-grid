import type {
    ColDef,
    FirstDataRenderedEvent,
    GridApi,
    GridOptions,
    PaginationNumberFormatterParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    PaginationModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([PaginationModule, ClientSideRowModelModule]);

const columnDefs: ColDef[] = [
    {
        field: 'athlete',
        minWidth: 170,
    },
    { field: 'age' },
    { field: 'country' },
    { field: 'date' },
    { field: 'total' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    columnDefs,
    pagination: true,
    paginationPageSize: 500,
    paginationPageSizeSelector: [200, 500, 1000],
    paginationPanels: [{ type: 'pageSummary', suppressPageInput: true }, 'rowSummary', 'pageSize'],
    onFirstDataRendered: onFirstDataRendered,
    paginationNumberFormatter: (params: PaginationNumberFormatterParams) => {
        return '[' + params.value.toLocaleString() + ']';
    },
};

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.paginationGoToPage(4);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then(function (data) {
            gridApi!.setGridOption('rowData', data);
        });
});
