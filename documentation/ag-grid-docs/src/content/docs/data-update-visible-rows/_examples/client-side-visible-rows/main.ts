import type { GetRowIdParams, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    HighlightChangesModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    VisibleRowsModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnsToolPanelModule, RowGroupingModule } from 'ag-grid-enterprise';

import type { ServerMessage, Stock } from './fakeSocket';
import { FakeSocket, fetchStocks } from './fakeSocket';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ClientSideRowModelApiModule,
    ColumnsToolPanelModule,
    HighlightChangesModule,
    NumberFilterModule,
    RowGroupingModule,
    TextFilterModule,
    VisibleRowsModule,
]);

const subscribed = new Set<string>();
let updatesSent = 0;
let stopSubscription: (() => void) | undefined;
let socket: FakeSocket;

let gridApi: GridApi<Stock>;

const gridOptions: GridOptions<Stock> = {
    columnDefs: [
        { field: 'sector', rowGroup: true, hide: true },
        { field: 'exchange' },
        { field: 'country' },
        { field: 'symbol', filter: 'agTextColumnFilter' },
        { field: 'price', filter: 'agNumberColumnFilter', enableCellChangeFlash: true },
        { field: 'change', headerName: 'Change %', enableCellChangeFlash: true },
        { field: 'volume', enableCellChangeFlash: true },
    ],
    // any column can be grouped, from the Columns Tool Panel
    defaultColDef: { flex: 1, minWidth: 100, enableRowGroup: true },
    groupDefaultExpanded: 1,
    sideBar: 'columns',
    getRowId: (params: GetRowIdParams<Stock>) => params.data.id,
    onGridReady: (params) => {
        params.api.setGridOption('rowData', fetchStocks());
        socket = new FakeSocket();
        socket.onmessage = (message) => onServerMessage(params.api, message);
        startSubscription(params.api, socket);
    },
};

function renderCount() {
    const subscribedCount = document.querySelector('#subscribedCount');
    const updatesSentCount = document.querySelector('#updatesSent');
    // the panel can be removed before the grid is destroyed, which unsubscribes the remaining rows
    if (subscribedCount && updatesSentCount) {
        subscribedCount.textContent = String(subscribed.size);
        updatesSentCount.textContent = String(updatesSent);
    }
}

function onServerMessage(api: GridApi<Stock>, message: ServerMessage) {
    updatesSent += message.rows.length;
    // ignore updates that were already on their way when their rows were unsubscribed
    const update = message.rows.filter((row) => subscribed.has(row.id));
    if (update.length) {
        api.applyTransactionAsync({ update });
    }
    renderCount();
}

function startSubscription(api: GridApi<Stock>, socket: FakeSocket) {
    stopSubscription = api.subscribeToVisibleRows(
        {
            onSubscribe: (rows) => {
                const ids = rows.map((row) => row.id);
                ids.forEach((id) => subscribed.add(id));
                socket.send({ type: 'subscribe', ids });
                console.log(`subscribe ${rows.length}`);
                renderCount();
            },
            onUnsubscribe: (rows) => {
                const ids = rows.map((row) => row.id);
                ids.forEach((id) => subscribed.delete(id));
                socket.send({ type: 'unsubscribe', ids });
                console.log(`unsubscribe ${rows.length}`);
                renderCount();
            },
        },
        {
            includeBuffer: document.querySelector<HTMLInputElement>('#includeBuffer')?.checked ?? false,
            includeGroups: document.querySelector<HTMLInputElement>('#includeGroups')?.checked ?? true,
        }
    );
}

function resetData() {
    gridApi.setGridOption('rowData', fetchStocks());
}

function toggleStream() {
    if (stopSubscription) {
        // unsubscribing every row also stops the server streaming
        stopSubscription();
        stopSubscription = undefined;
    } else {
        startSubscription(gridApi, socket);
    }
    document.querySelector('#toggleStream')!.textContent = stopSubscription ? 'Stop' : 'Start';
}

function onOptionsChanged() {
    // the options are fixed for a subscription, so subscribe again to apply them
    if (stopSubscription) {
        stopSubscription();
        startSubscription(gridApi, socket);
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
