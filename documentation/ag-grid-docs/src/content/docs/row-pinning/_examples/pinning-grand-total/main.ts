import type { ColDef, GridApi, GridOptions, RowPinnedType } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import { ContextMenuModule, ManualPinnedRowModule, RowGroupingModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ManualPinnedRowModule,
    ClientSideRowModelModule,
    RowGroupingModule,
    ContextMenuModule,
    ValidationModule /* Development Only */,
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
    onFirstDataRendered() {
        setGrandTotalRow(getGrandTotalRow());
    },
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

function setGrandTotalRow(value: GridOptions['grandTotalRow']) {
    gridApi.setGridOption('grandTotalRow', value);
}

function setIsRowPinned(value: RowPinnedType) {
    gridApi.setGridOption('isRowPinned', (node) => {
        if (node.level === -1 && node.footer) {
            return value;
        }
    });
}

function update(value: GridOptions['grandTotalRow'] | 'isRowPinned') {
    if (value === 'isRowPinned') {
        setGrandTotalRow('bottom');
        setIsRowPinned('top');
    } else {
        setGrandTotalRow(value);
    }
}
