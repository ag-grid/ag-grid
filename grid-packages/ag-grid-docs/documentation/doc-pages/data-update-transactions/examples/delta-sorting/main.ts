import { GetRowIdParams, Grid, GridOptions } from '@ag-grid-community/core'

let lastGen = 0;
const generateItem = (id = lastGen++) => {
    return {
        id,
        sort: Math.floor(Math.random() * 3 + 2000),
        sort1: Math.floor(Math.random() *  3 + 2000),
        sort2: Math.floor(Math.random() * 100000 + 2000),
    };
};

const getRowData = (rows = 10) => new Array(rows).fill(undefined).map(_ => generateItem());

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'id' },
        { field: 'updatedBy' },
        { field: 'sort', sortIndex: 0, sort: 'desc' },
        { field: 'sort1', sortIndex: 1, sort: 'desc' },
        { field: 'sort2', sortIndex: 2, sort: 'desc' },
    ],
    defaultColDef: {
        sortable: true,
        flex: 1,
    },
    rowData: getRowData(100000),
    deltaSort: true,
    getRowId: ({ data }: GetRowIdParams) => data.id,
};

function addDelta() {
    const transaction = {
        add: getRowData(1).map(row => ({ ...row, updatedBy: 'delta' })),
        update: [{ id: 1, make: 'Delta', updatedBy: 'delta' }],
    };
    gridOptions.api!.setDeltaSort(true);
    const startTime = new Date().getTime();
    gridOptions.api!.applyTransaction(transaction);
    document.getElementById('transactionDuration')!.innerText = `${new Date().getTime() - startTime} ms`;
};

function addDefault() {
    const transaction = {
        add: getRowData(1).map(row => ({ ...row, updatedBy: 'default' })),
        update: [{ id: 2, make: 'Default', updatedBy: 'default' }],
    };
    gridOptions.api!.setDeltaSort(false);
    const startTime = new Date().getTime();
    gridOptions.api!.applyTransaction(transaction);
    document.getElementById('transactionDuration')!.innerText = `${new Date().getTime() - startTime} ms`;

};

document.addEventListener('DOMContentLoaded', function () {
    const eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    new Grid(eGridDiv, gridOptions);
});
