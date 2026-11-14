import type { GetRowIdParams, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    HighlightChangesModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ViewSubscriptionModule } from 'ag-grid-enterprise';

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
    ViewSubscriptionModule,
]);

let gridApi: GridApi<Stock>;
const subscribed = new Set<string>();
const socket = new FakeSocket();

const gridOptions: GridOptions<Stock> = {
    columnDefs: [
        { field: 'symbol' },
        { field: 'exchange' },
        { field: 'country' },
        { field: 'price', enableCellChangeFlash: true },
        { field: 'change', headerName: 'Change %', enableCellChangeFlash: true },
        { field: 'volume', enableCellChangeFlash: true },
    ],
    defaultColDef: { flex: 1, minWidth: 100 },
    getRowId: (params: GetRowIdParams<Stock>) => params.data.id,
    viewSubscription: {
        subscribeRows: (rows) => {
            const ids = rows.map((row) => row.id);
            ids.forEach((id) => subscribed.add(id));
            socket.send({ type: 'subscribe', ids });
            recordSubscribed(subscribed.size);
        },
        unsubscribeRows: (rows) => {
            const ids = rows.map((row) => row.id);
            ids.forEach((id) => subscribed.delete(id));
            socket.send({ type: 'unsubscribe', ids });
            recordUnsubscribed(subscribed.size);
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

function onServerMessage(api: GridApi<Stock>, message: ServerMessage) {
    // ignore updates that were already on their way when their rows were unsubscribed
    const update = message.rows.filter((row) => subscribed.has(row.id));
    if (update.length) {
        api.applyTransactionAsync({ update });
    }
    recordUpdates(update.length);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
