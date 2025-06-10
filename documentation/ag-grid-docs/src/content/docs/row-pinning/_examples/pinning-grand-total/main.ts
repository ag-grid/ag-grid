import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    PinnedRowModule,
    ValidationModule,
    createGrid,
    themeQuartz,
} from 'ag-grid-community';
import { ContextMenuModule, RowGroupingModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    RowGroupingModule,
    ContextMenuModule,
    PinnedRowModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const columnDefs: ColDef[] = [
    { field: 'athlete' },
    { field: 'country', rowGroup: true, hide: true },
    { field: 'sport' },
    { field: 'gold', aggFunc: 'sum' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        flex: 1,
    },
    autoGroupColumnDef: {
        headerName: 'Country',
    },
    columnDefs,
    rowData: null,
    enableRowPinning: true,
    onFirstDataRendered: () => {
        gridApi.setGridOption('grandTotalRow', getGTR());
        gridApi.setGridOption('grandTotalRowPinned', getGTRP());
    },
    theme: themeQuartz.withParams({
        pinnedRowBorder: {
            width: 2,
        },
    }),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});

function updateGrandTotalRow() {
    gridApi.setGridOption('grandTotalRow', getGTR());
}

function updateGrandTotalRowPinned() {
    gridApi.setGridOption('grandTotalRowPinned', getGTRP());
}

function useIsRowPinned() {
    gridApi.setGridOption('grandTotalRowPinned', undefined);
    gridApi.setGridOption('isRowPinned', (node) => {
        if (node.level === -1 && node.footer) {
            return 'top';
        }
    });
}

function reset() {
    gridApi.setGridOption('isRowPinned', undefined);
    gridApi.setGridOption('grandTotalRow', getGTR());
    gridApi.setGridOption('grandTotalRowPinned', getGTRP());
}

function getGTR() {
    return document.querySelector<HTMLSelectElement>('#select-grand-total-row')?.value as GridOptions['grandTotalRow'];
}

function getGTRP() {
    return document.querySelector<HTMLSelectElement>('#select-grand-total-row-pinned')
        ?.value as GridOptions['grandTotalRowPinned'];
}
