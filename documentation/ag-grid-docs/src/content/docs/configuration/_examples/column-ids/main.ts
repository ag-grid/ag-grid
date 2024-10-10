import { ClientSideRowModelModule } from 'ag-grid-community';
import type { GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        // colId will be 'firstCol'
        { headerName: 'Col 1', colId: 'firstCol', field: 'height' },
        // colId will be 'firstCol_1', cos 'firstCol' already taken
        { headerName: 'Col 2', colId: 'firstCol', field: 'height' },

        // colId will be 'height'
        { headerName: 'Col 3', field: 'height' },
        // colId will be 'height_1', cos 'height' already taken
        { headerName: 'Col 4', field: 'height' },

        // no colId, no field, so grid generated ID
        { headerName: 'Col 5', valueGetter: 'data.width' },
        { headerName: 'Col 6', valueGetter: 'data.width' },
    ],
    rowData: createRowData(),
    onGridReady: (params: GridReadyEvent) => {
        const cols = params.api.getColumns()!;
        cols.forEach((col) => {
            const colDef = col.getColDef();
            console.log(colDef.headerName + ', Column ID = ' + col.getId(), JSON.stringify(colDef));
        });
    },
};

const pRandom = (() => {
    // From https://stackoverflow.com/a/3062783
    let seed = 123_456_789;
    const m = 2 ** 32;
    const a = 1_103_515_245;
    const c = 12_345;

    return () => {
        seed = (a * seed + c) % m;
        return seed / m;
    };
})();

function createRowData() {
    const data = [];
    for (let i = 0; i < 20; i++) {
        data.push({
            height: Math.floor(pRandom() * 100),
            width: Math.floor(pRandom() * 100),
            depth: Math.floor(pRandom() * 100),
        });
    }
    return data;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
