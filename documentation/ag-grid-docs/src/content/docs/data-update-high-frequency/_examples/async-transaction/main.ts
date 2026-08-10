import type { ColDef, GetRowIdParams, GridApi, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    HighlightChangesModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

import { getData, globalRowData } from './data';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelApiModule,
    CellStyleModule,
    ClientSideRowModelModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    HighlightChangesModule,
]);

const UPDATE_COUNT = 5000;

const columnDefs: ColDef[] = [
    // these are the row groups, so they are all hidden (they are show in the group column)
    {
        headerName: 'Product',
        field: 'product',
        enableRowGroup: true,
        rowGroupIndex: 0,
        hide: true,
    },
    {
        headerName: 'Portfolio',
        field: 'portfolio',
        enableRowGroup: true,
        rowGroupIndex: 1,
        hide: true,
    },
    {
        headerName: 'Book',
        field: 'book',
        enableRowGroup: true,
        rowGroupIndex: 2,
        hide: true,
    },
    { headerName: 'Trade', field: 'trade', width: 100 },

    // all the other columns (visible and not grouped)
    {
        field: 'current',
        width: 200,
        aggFunc: 'sum',
        enableValue: true,
        cellClass: 'number',
        valueFormatter: numberCellFormatter,
        cellRenderer: 'agAnimateShowChangeCellRenderer',
    },
    {
        field: 'previous',
        width: 200,
        aggFunc: 'sum',
        enableValue: true,
        cellClass: 'number',
        valueFormatter: numberCellFormatter,
        cellRenderer: 'agAnimateShowChangeCellRenderer',
    },
    {
        field: 'dealType',
        enableRowGroup: true,
    },
    {
        headerName: 'Bid',
        field: 'bidFlag',
        enableRowGroup: true,
        width: 100,
    },
    {
        headerName: 'PL 1',
        field: 'pl1',
        width: 200,
        aggFunc: 'sum',
        enableValue: true,
        cellClass: 'number',
        valueFormatter: numberCellFormatter,
        cellRenderer: 'agAnimateShowChangeCellRenderer',
    },
    {
        headerName: 'PL 2',
        field: 'pl2',
        width: 200,
        aggFunc: 'sum',
        enableValue: true,
        cellClass: 'number',
        valueFormatter: numberCellFormatter,
        cellRenderer: 'agAnimateShowChangeCellRenderer',
    },
    {
        headerName: 'Gain-DX',
        field: 'gainDx',
        width: 200,
        aggFunc: 'sum',
        enableValue: true,
        cellClass: 'number',
        valueFormatter: numberCellFormatter,
        cellRenderer: 'agAnimateShowChangeCellRenderer',
    },
    {
        headerName: 'SX / PX',
        field: 'sxPx',
        width: 200,
        aggFunc: 'sum',
        enableValue: true,
        cellClass: 'number',
        valueFormatter: numberCellFormatter,
        cellRenderer: 'agAnimateShowChangeCellRenderer',
    },
    {
        headerName: '99 Out',
        field: '_99Out',
        width: 200,
        aggFunc: 'sum',
        enableValue: true,
        cellClass: 'number',
        valueFormatter: numberCellFormatter,
        cellRenderer: 'agAnimateShowChangeCellRenderer',
    },
    {
        field: 'submitterID',
        width: 200,
        aggFunc: 'sum',
        enableValue: true,
        cellClass: 'number',
        valueFormatter: numberCellFormatter,
        cellRenderer: 'agAnimateShowChangeCellRenderer',
    },
    {
        field: 'submitterDealID',
        width: 200,
        aggFunc: 'sum',
        enableValue: true,
        cellClass: 'number',
        valueFormatter: numberCellFormatter,
        cellRenderer: 'agAnimateShowChangeCellRenderer',
    },
];

function numberCellFormatter(params: ValueFormatterParams) {
    return Math.floor(params.value)
        .toString()
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

let gridApi: GridApi;
const gridOptions: GridOptions = {
    columnDefs: columnDefs,
    suppressAggFuncInHeader: true,
    rowGroupPanelShow: 'always',
    getRowId: (params: GetRowIdParams) => String(params.data.trade),
    defaultColDef: {
        width: 120,
    },
    autoGroupColumnDef: {
        width: 250,
    },
    onGridReady: (params) => {
        getData();
        params.api.setGridOption('rowData', globalRowData);
    },
};

// picks a row at random and returns an updated copy: the old current value
// becomes the previous value, and a new random current value is generated.
// the updated row is also written back to globalRowData, so the next update
// to that row starts from the latest values.
function createRandomUpdate() {
    const index = Math.floor(Math.random() * globalRowData.length);
    const item = globalRowData[index];
    const updatedItem = {
        ...item,
        previous: item.current,
        current: Math.floor(Math.random() * 100000) + 100,
    };
    globalRowData[index] = updatedItem;
    return updatedItem;
}

function setMessage(msg: string) {
    const eMessage = document.querySelector('#eMessage')!;
    eMessage.textContent = msg;
}

function onNormalUpdate() {
    const startMillis = new Date().getTime();

    setMessage('Running Transaction');

    for (let i = 0; i < UPDATE_COUNT; i++) {
        setTimeout(() => {
            // do normal update. update is done before method returns
            gridApi.applyTransaction({ update: [createRandomUpdate()] });
        }, 0);
    }

    // print message in next VM turn to allow browser to refresh first.
    // we assume the browser executes the timeouts in order they are created,
    // so this timeout executes after all the update timeouts created above.
    setTimeout(() => {
        const duration = new Date().getTime() - startMillis;
        setMessage('Transaction took ' + duration.toLocaleString() + 'ms');
    }, 0);
}

function onAsyncUpdate() {
    const startMillis = new Date().getTime();

    setMessage('Running Async');

    let updatedCount = 0;
    for (let i = 0; i < UPDATE_COUNT; i++) {
        setTimeout(() => {
            // update using async method. passing the callback is
            // optional, we are doing it here so we know when the update
            // was processed by the grid.
            gridApi.applyTransactionAsync({ update: [createRandomUpdate()] }, resultCallback);
        }, 0);
    }

    function resultCallback() {
        updatedCount++;
        if (updatedCount === UPDATE_COUNT) {
            // print message in next VM turn to allow browser to refresh
            setTimeout(() => {
                const duration = new Date().getTime() - startMillis;
                setMessage('Async took ' + duration.toLocaleString() + 'ms');
            }, 0);
        }
    }
}

// after page is loaded, create the grid.
document.addEventListener('DOMContentLoaded', function () {
    const eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(eGridDiv, gridOptions);
});
