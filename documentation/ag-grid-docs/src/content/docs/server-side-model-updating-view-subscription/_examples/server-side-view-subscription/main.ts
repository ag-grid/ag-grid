import type {
    GetRowIdParams,
    GridApi,
    GridOptions,
    IServerSideDatasource,
    IServerSideGetRowsParams,
} from 'ag-grid-community';
import { HighlightChangesModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import {
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
    TreeDataModule,
    ViewSubscriptionModule,
} from 'ag-grid-enterprise';

import { recordSubscribed, recordUnsubscribed, recordUpdates } from './counters';
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
    ViewSubscriptionModule,
]);

let gridApi: GridApi<PortfolioRow>;
// the parent keys of each subscribed row, which are the route to the store that holds it
const subscribed = new Map<string, string[]>();
// getRows requests waiting for their reply, by request id
const pendingRequests = new Map<number, IServerSideGetRowsParams<PortfolioRow>>();
let nextRequestId = 0;
const socket = new FakeSocket();

const gridOptions: GridOptions<PortfolioRow> = {
    columnDefs: [
        { field: 'price', enableCellChangeFlash: true },
        { field: 'shares' },
        { field: 'value', valueFormatter: (params) => params.value?.toFixed(2) ?? '', enableCellChangeFlash: true },
    ],
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
    viewSubscription: {
        // the server streams the price and value of a stock row, and the total value of a region or sector row
        subscribeRows: (rows) => {
            rows.forEach((row) => subscribed.set(row.id, row.parentKeys));
            socket.send({ type: 'subscribe', ids: rows.map((row) => row.id) });
            recordSubscribed(rows.length, subscribed.size);
        },
        unsubscribeRows: (rows) => {
            const ids = rows.map((row) => row.id).filter((id) => subscribed.delete(id));
            socket.send({ type: 'unsubscribe', ids });
            recordUnsubscribed(ids.length, subscribed.size);
        },
    },
    onGridReady: (params) => {
        socket.onmessage = (message) => onServerMessage(params.api, message);
        params.api.setGridOption('serverSideDatasource', createDatasource());
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

function onPurge() {
    gridApi.refreshServerSide({ purge: true });
}

function createDatasource(): IServerSideDatasource<PortfolioRow> {
    return {
        getRows: (params) => {
            const requestId = nextRequestId++;
            pendingRequests.set(requestId, params);
            socket.send({ type: 'getRows', requestId, request: params.request });
        },
    };
}

function onServerMessage(api: GridApi<PortfolioRow>, message: ServerMessage) {
    if (message.type === 'rows') {
        const { requestId, rowData, rowCount } = message;
        pendingRequests.get(requestId)?.success({ rowData, rowCount });
        pendingRequests.delete(requestId);
        return;
    }

    let updates = 0;
    // rows unsubscribed while an update was on its way are no longer in the map, so are skipped
    for (const row of message.rows) {
        const route = subscribed.get(row.id);
        if (route) {
            api.applyServerSideTransactionAsync({ route, update: [row] });
            updates++;
        }
    }
    recordUpdates(updates);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
