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
import { RowGroupingModule } from 'ag-grid-enterprise';

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
    RowGroupingModule,
    TextFilterModule,
    VisibleRowsModule,
]);

const subscribed = new Set<string>();
let updatesSent = 0;
let stopSubscription: (() => void) | undefined;

let gridApi: GridApi<Stock>;

const gridOptions: GridOptions<Stock> = {
    columnDefs: [
        { field: 'sector', rowGroup: true, hide: true },
        { field: 'symbol', filter: 'agTextColumnFilter' },
        { field: 'price', filter: 'agNumberColumnFilter', enableCellChangeFlash: true },
    ],
    defaultColDef: { flex: 1 },
    groupDefaultExpanded: 1,
    getRowId: (params: GetRowIdParams<Stock>) => params.data.id,
    onGridReady: (params) => {
        params.api.setGridOption('rowData', fetchStocks());
        const socket = new FakeSocket();
        socket.onmessage = (message) => onServerMessage(params.api, message);
        startSubscription(params.api, socket);
    },
};

function renderCount() {
    document.querySelector('#subscribedCount')!.textContent = String(subscribed.size);
    document.querySelector('#updatesSent')!.textContent = String(updatesSent);
}

function addLogEntry(text: string) {
    const log = document.querySelector('#log')!;
    const entry = document.createElement('li');
    entry.textContent = text;
    log.prepend(entry);
    while (log.children.length > 8) {
        log.lastElementChild!.remove();
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
    stopSubscription = api.subscribeToVisibleRows({
        onSubscribe: (rows, params) => {
            const ids = rows.map((row) => row.id);
            ids.forEach((id) => subscribed.add(id));
            socket.send({ type: 'subscribe', ids });
            addLogEntry(`subscribe ${rows.length} (${params.reason})`);
            renderCount();
        },
        onUnsubscribe: (rows, params) => {
            const ids = rows.map((row) => row.id);
            ids.forEach((id) => subscribed.delete(id));
            socket.send({ type: 'unsubscribe', ids });
            addLogEntry(`unsubscribe ${rows.length} (${params.reason})`);
            renderCount();
        },
    });
}

function resetData() {
    gridApi.setGridOption('rowData', fetchStocks());
}

function stopStream() {
    // unsubscribing every row also stops the server streaming
    stopSubscription?.();
    stopSubscription = undefined;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
