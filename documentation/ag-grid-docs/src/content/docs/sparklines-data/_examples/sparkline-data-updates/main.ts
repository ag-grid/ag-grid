import { ClientSideRowModelModule } from 'ag-grid-community';
import type { GridApi, GridOptions } from 'ag-grid-community';
import { createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { SparklinesModule } from 'ag-grid-enterprise';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule, SparklinesModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'symbol', maxWidth: 120 },
        { field: 'name', minWidth: 250 },
        {
            field: 'change',
            cellRenderer: 'agSparklineCellRenderer',
        },
        {
            field: 'volume',
            type: 'numericColumn',
            maxWidth: 140,
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    rowData: getData(),
    rowHeight: 50,
};

let intervalId: any;

function start() {
    if (intervalId) {
        return;
    }

    const updateData = () => {
        const itemsToUpdate: any[] = [];
        gridApi!.forEachNodeAfterFilterAndSort(function (rowNode) {
            const data = rowNode.data;
            if (!data) {
                return;
            }
            const n = data.change.length;
            const v = pRandom() > 0.5 ? Number(pRandom()) : -Number(pRandom());
            data.change = [...data.change.slice(1, n), v];
            itemsToUpdate.push(data);
        });
        gridApi!.applyTransaction({ update: itemsToUpdate });
    };

    intervalId = setInterval(updateData, 300);
}

function stop() {
    if (intervalId === undefined) {
        return;
    }
    clearInterval(intervalId);
    intervalId = undefined;
}

// setup the grid after the page has finished loading

document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});

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
