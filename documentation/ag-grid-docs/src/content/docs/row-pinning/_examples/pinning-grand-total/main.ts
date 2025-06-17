import type { ColDef, GridApi, GridOptions, RowPinnedType } from 'ag-grid-community';
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
        const value = getGrandTotalRow();
        if (value === 'isRowPinned') {
            setGrandTotalRow(gridApi, 'bottom');
            setIsRowPinned(gridApi, 'top');
        } else {
            setGrandTotalRow(gridApi, value);
        }
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
    return document.querySelector<HTMLSelectElement>('#select-grand-total-row')?.value as
        | GridOptions['grandTotalRow']
        | 'isRowPinned';
}

function setGrandTotalRow(api: GridApi<IOlympicData>, value: GridOptions['grandTotalRow']) {
    api.setGridOption('grandTotalRow', value);
}

function setIsRowPinned(api: GridApi<IOlympicData>, value: RowPinnedType) {
    api.setGridOption('isRowPinned', (node) => {
        if (node.level === -1 && node.footer) {
            return value;
        }
    });
}

function update() {
    const value = getGrandTotalRow();
    if (value === 'isRowPinned') {
        setGrandTotalRow(gridApi, 'bottom');
        setIsRowPinned(gridApi, 'top');
    } else {
        setGrandTotalRow(gridApi, value);
    }
}
