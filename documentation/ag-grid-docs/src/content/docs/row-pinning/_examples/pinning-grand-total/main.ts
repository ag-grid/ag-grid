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
        updateGrandTotalRow();
        updateGrandTotalRowPinned();
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

function getGrandTotalRow() {
    return document.querySelector<HTMLSelectElement>('#select-grand-total-row')?.value as GridOptions['grandTotalRow'];
}

function setGrandTotalRow(api: GridApi<IOlympicData>, value: GridOptions['grandTotalRow']) {
    api.setGridOption('grandTotalRow', value);
}

function getGrandTotalRowPinned() {
    return document.querySelector<HTMLSelectElement>('#select-grand-total-row-pinned')
        ?.value as GridOptions['grandTotalRowPinned'];
}

function setGrandTotalRowPinned(api: GridApi<IOlympicData>, value: GridOptions['grandTotalRowPinned']) {
    api.setGridOption('grandTotalRowPinned', value);
}

function useIsRowPinned() {
    setGrandTotalRowPinned(gridApi, undefined);
    gridApi.setGridOption('isRowPinned', (node) => {
        if (node.level === -1 && node.footer) {
            return 'top';
        }
    });
}

function reset() {
    gridApi.setGridOption('isRowPinned', undefined);
    updateGrandTotalRow();
    updateGrandTotalRowPinned();
}

function updateGrandTotalRow() {
    const value = getGrandTotalRow();
    setGrandTotalRow(gridApi, value);
}

function updateGrandTotalRowPinned() {
    setGrandTotalRowPinned(gridApi, getGrandTotalRowPinned());
}
