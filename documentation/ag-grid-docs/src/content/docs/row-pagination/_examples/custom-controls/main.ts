import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    PaginationModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
    PaginationModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

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
    paginationPageSize: 500,
    paginationPageSizeSelector: [100, 500, 1000],
    columnDefs,
    pagination: true,
    suppressPaginationPanel: true,
    suppressScrollOnNewData: true,
    onPaginationChanged: onPaginationChanged,
};

function setText(selector: string, text: any) {
    (document.querySelector(selector) as any).innerHTML = text;
}

function onPaginationChanged() {
    console.log('onPaginationPageLoaded');

    // Workaround for bug in events order
    if (gridApi!) {
        setText('#lbLastPageFound', gridApi!.paginationIsLastPageFound());
        setText('#lbPageSize', gridApi!.paginationGetPageSize());
        // we +1 to current page, as pages are zero based
        setText('#lbCurrentPage', gridApi!.paginationGetCurrentPage() + 1);
        setText('#lbTotalPages', gridApi!.paginationGetTotalPages());

        setLastButtonDisabled(!gridApi!.paginationIsLastPageFound());
    }
}

function setLastButtonDisabled(disabled: boolean) {
    (document.querySelector('#btLast') as any).disabled = disabled;
}

function onBtFirst() {
    gridApi!.paginationGoToFirstPage();
}

function onBtLast() {
    gridApi!.paginationGoToLastPage();
}

function onBtNext() {
    gridApi!.paginationGoToNextPage();
}

function onBtPrevious() {
    gridApi!.paginationGoToPreviousPage();
}

function onBtPageFive() {
    // we say page 4, as the first page is zero
    gridApi!.paginationGoToPage(4);
}

function onBtPageFifty() {
    // we say page 49, as the first page is zero
    gridApi!.paginationGoToPage(49);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
