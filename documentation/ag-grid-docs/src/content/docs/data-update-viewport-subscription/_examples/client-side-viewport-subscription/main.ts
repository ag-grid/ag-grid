import type { GetRowIdParams, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    HighlightChangesModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    ViewportSubscriptionModule,
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
    ViewportSubscriptionModule,
]);

const subscribed = new Set<string>();
let updatesSent = 0;
let streaming = true;
const socket = new FakeSocket();

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
    viewportSubscription: {
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
    onGridReady: (params) => {
        socket.onmessage = (message) => onServerMessage(params.api, message);
        params.api.setGridOption('rowData', fetchStocks());
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

function resetData() {
    gridApi.setGridOption('rowData', fetchStocks());
}

function setStreaming(value: boolean) {
    streaming = value;
    document.querySelector('#toggleStream')!.textContent = streaming ? 'Stop' : 'Start';
}

function toggleStream() {
    // unsubscribing every row also stops the server streaming
    if (streaming) {
        gridApi.unsubscribeFromViewport();
    } else {
        gridApi.subscribeToViewport();
    }
    setStreaming(!streaming);
}

function onOptionsChanged() {
    // changing the option unsubscribes every row, then subscribes again with the new option
    gridApi.setGridOption('viewportSubscription', {
        ...gridApi.getGridOption('viewportSubscription')!,
        includeBuffer: document.querySelector<HTMLInputElement>('#includeBuffer')!.checked,
        includeGroups: document.querySelector<HTMLInputElement>('#includeGroups')!.checked,
    });
    setStreaming(true);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
