import type {
    GetRowIdParams,
    GridApi,
    GridOptions,
    IServerSideDatasource,
    IServerSideGetRowsParams,
} from 'ag-grid-community';
import {
    HighlightChangesModule,
    ModuleRegistry,
    VisibleRowsModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule, TreeDataModule } from 'ag-grid-enterprise';

import type { PortfolioRow, ServerMessage } from './fakeSocket';
import { FakeSocket } from './fakeSocket';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    HighlightChangesModule,
    ServerSideRowModelModule,
    ServerSideRowModelApiModule,
    TreeDataModule,
    VisibleRowsModule,
]);

// the parent keys of each subscribed row, which are the route to the store that holds it
const subscribed = new Map<string, string[]>();
// getRows requests waiting for their reply, by request id
const pendingRequests = new Map<number, IServerSideGetRowsParams<PortfolioRow>>();
let nextRequestId = 0;
let updatesSent = 0;
let stopSubscription: (() => void) | undefined;
let socket: FakeSocket;

let gridApi: GridApi<PortfolioRow>;

const gridOptions: GridOptions<PortfolioRow> = {
    columnDefs: [{ field: 'price', enableCellChangeFlash: true }],
    defaultColDef: { flex: 1 },
    autoGroupColumnDef: { field: 'name', headerName: 'Portfolio' },
    rowModelType: 'serverSide',
    treeData: true,
    isServerSideGroup: (data) => data.group,
    getServerSideGroupKey: (data) => data.name,
    isServerSideGroupOpenByDefault: () => true,
    cacheBlockSize: 50,
    // the id is the row's path, so it is unique across levels
    getRowId: (params: GetRowIdParams<PortfolioRow>) => params.data.id,
    onGridReady: (params) => {
        socket = new FakeSocket();
        socket.onmessage = (message) => onServerMessage(params.api, message);
        params.api.setGridOption('serverSideDatasource', createDatasource(socket));
        startSubscription(params.api, socket);
    },
};

function createDatasource(socket: FakeSocket): IServerSideDatasource<PortfolioRow> {
    return {
        getRows: (params) => {
            const requestId = nextRequestId++;
            pendingRequests.set(requestId, params);
            socket.send({ type: 'getRows', requestId, request: params.request });
        },
    };
}

function renderCount() {
    const subscribedCount = document.querySelector('#subscribedCount');
    const updatesSentCount = document.querySelector('#updatesSent');
    // the panel can be removed before the grid is destroyed, which unsubscribes the remaining rows
    if (subscribedCount && updatesSentCount) {
        subscribedCount.textContent = String(subscribed.size);
        updatesSentCount.textContent = String(updatesSent);
    }
}

function onServerMessage(api: GridApi<PortfolioRow>, message: ServerMessage) {
    if (message.type === 'rows') {
        const { requestId, rowData, rowCount } = message;
        pendingRequests.get(requestId)?.success({ rowData, rowCount });
        pendingRequests.delete(requestId);
        return;
    }

    updatesSent += message.rows.length;
    // rows unsubscribed while an update was on its way are no longer in the map, so are skipped
    for (const row of message.rows) {
        const route = subscribed.get(row.id);
        if (route) {
            api.applyServerSideTransactionAsync({ route, update: [row] });
        }
    }
    renderCount();
}

function startSubscription(api: GridApi<PortfolioRow>, socket: FakeSocket) {
    stopSubscription = api.subscribeToVisibleRows({
        onSubscribe: (rows) => {
            rows.forEach((row) => subscribed.set(row.id, row.parentKeys));
            socket.send({ type: 'subscribe', ids: rows.map((row) => row.id) });
            console.log(`subscribe ${rows.length}`);
            renderCount();
        },
        onUnsubscribe: (rows) => {
            rows.forEach((row) => subscribed.delete(row.id));
            socket.send({ type: 'unsubscribe', ids: rows.map((row) => row.id) });
            console.log(`unsubscribe ${rows.length}`);
            renderCount();
        },
    });
}

function purge() {
    gridApi.refreshServerSide({ purge: true });
}

function toggleStream() {
    if (stopSubscription) {
        // unsubscribing every row also stops the server streaming, while rows still load over the socket
        stopSubscription();
        stopSubscription = undefined;
    } else {
        startSubscription(gridApi, socket);
    }
    document.querySelector('#toggleStream')!.textContent = stopSubscription ? 'Stop' : 'Start';
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
