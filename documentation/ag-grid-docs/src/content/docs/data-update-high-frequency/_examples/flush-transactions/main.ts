import type {
    AsyncTransactionsFlushedEvent,
    ColDef,
    GetRowIdParams,
    GridApi,
    GridOptions,
    ValueFormatterParams,
} from 'ag-grid-community';
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

const UPDATE_COUNT = 20;

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
        headerName: 'Current',
        field: 'current',
        width: 200,
        aggFunc: 'sum',
        enableValue: true,
        cellClass: 'number',
        valueFormatter: numberCellFormatter,
        cellRenderer: 'agAnimateShowChangeCellRenderer',
    },
    {
        headerName: 'Previous',
        field: 'previous',
        width: 200,
        aggFunc: 'sum',
        enableValue: true,
        cellClass: 'number',
        valueFormatter: numberCellFormatter,
        cellRenderer: 'agAnimateShowChangeCellRenderer',
    },
    {
        headerName: 'Deal Type',
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
        headerName: 'Submitter ID',
        field: 'submitterID',
        width: 200,
        aggFunc: 'sum',
        enableValue: true,
        cellClass: 'number',
        valueFormatter: numberCellFormatter,
        cellRenderer: 'agAnimateShowChangeCellRenderer',
    },
    {
        headerName: 'Submitted Deal ID',
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
    asyncTransactionWaitMillis: 4000,
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
        startFeed(params.api);
    },
    onAsyncTransactionsFlushed: (e: AsyncTransactionsFlushedEvent) => {
        console.log('========== onAsyncTransactionsFlushed: applied ' + e.results.length + ' transactions');
    },
};

function onFlushTransactions() {
    gridApi!.flushAsyncTransactions();
}

function startFeed(api: GridApi) {
    let count = 1;

    setInterval(() => {
        const thisCount = count++;
        const updatedIndexes = new Set<number>();
        const updatedItems: any[] = [];
        for (let i = 0; i < UPDATE_COUNT; i++) {
            // pick one row at random, skipping rows already updated in this transaction
            const index = Math.floor(Math.random() * globalRowData.length);
            if (updatedIndexes.has(index)) {
                continue;
            }
            updatedIndexes.add(index);

            // the old current value becomes the previous value
            const item = globalRowData[index];
            const updatedItem = {
                ...item,
                previous: item.current,
                current: Math.floor(Math.random() * 100000) + 100,
            };

            // write back, so the next update to this row starts from the latest values
            globalRowData[index] = updatedItem;
            updatedItems.push(updatedItem);
        }
        api.applyTransactionAsync({ update: updatedItems }, () => {
            console.log('transactionApplied() - ' + thisCount);
        });
        console.log('applyTransactionAsync() - ' + thisCount);
    }, 500);
}

// after page is loaded, create the grid.
document.addEventListener('DOMContentLoaded', function () {
    const eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(eGridDiv, gridOptions);
});
