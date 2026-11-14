import type { GetRowIdParams, GridApi, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    HighlightChangesModule,
    ModuleRegistry,
    NumberFilterModule,
    RowApiModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { RowGroupingModule, ViewSubscriptionModule } from 'ag-grid-enterprise';

import { recordSubscribed, recordUnsubscribed, recordUpdates } from './counters';
import type { ServerMessage, Stock } from './fakeSocket';
import { FakeSocket, fetchStocks } from './fakeSocket';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ClientSideRowModelApiModule,
    HighlightChangesModule,
    NumberFilterModule,
    RowApiModule,
    RowGroupingModule,
    TextFilterModule,
    ViewSubscriptionModule,
]);

let gridApi: GridApi<Stock>;
const subscribed = new Set<string>();
const socket = new FakeSocket();

const gridOptions: GridOptions<Stock> = {
    columnDefs: [
        { field: 'sector', rowGroup: true, hide: true },
        { field: 'exchange' },
        { field: 'country' },
        { field: 'symbol', filter: 'agTextColumnFilter' },
        { field: 'price', filter: 'agNumberColumnFilter', valueFormatter: formatNumber, enableCellChangeFlash: true },
        { field: 'change', headerName: 'Change %', valueFormatter: formatNumber, enableCellChangeFlash: true },
        { field: 'volume', enableCellChangeFlash: true },
    ],
    defaultColDef: { flex: 1, minWidth: 100 },
    groupDefaultExpanded: 1,
    getRowId: (params: GetRowIdParams<Stock>) => params.data.id,
    viewSubscription: {
        // the server streams prices for stocks only, as the group rows show no stock data
        subscribeRows: (rows) => {
            const ids = rows.filter((row) => row.type === 'leaf').map((row) => row.id);
            ids.forEach((id) => subscribed.add(id));
            socket.send({ type: 'subscribe', ids });
            recordSubscribed(ids.length, subscribed.size);
        },
        unsubscribeRows: (rows) => {
            const ids = rows.map((row) => row.id).filter((id) => subscribed.delete(id));
            socket.send({ type: 'unsubscribe', ids });
            recordUnsubscribed(ids.length, subscribed.size);
        },
    },
    onGridReady: (params) => {
        socket.onmessage = (message) => onServerMessage(params.api, message);
        params.api.setGridOption('rowData', fetchStocks());
    },
    // updates still on their way must not reach the destroyed grid
    onGridPreDestroyed: () => {
        socket.onmessage = null;
    },
};

function onSubscriptionActiveChanged() {
    const checked = document.querySelector<HTMLInputElement>('#subscriptionActive')!.checked;
    gridApi.setGridOption('viewSubscriptionActive', checked);
}

function formatNumber(params: ValueFormatterParams<Stock>) {
    return params.value == null ? '' : params.value.toFixed(2);
}

function onServerMessage(api: GridApi<Stock>, message: ServerMessage) {
    // ignore updates that were already on their way when their rows were unsubscribed or removed,
    // as new row data removes the rows before the debounced unsubscribe arrives
    const update = message.rows.filter((row) => subscribed.has(row.id) && api.getRowNode(row.id) !== undefined);
    if (update.length) {
        api.applyTransactionAsync({ update });
    }
    recordUpdates(update.length);
}

function onNewRowData() {
    // apply the queued updates while their stocks are still in the grid
    gridApi.flushAsyncTransactions();
    gridApi.setGridOption('rowData', fetchStocks());
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
