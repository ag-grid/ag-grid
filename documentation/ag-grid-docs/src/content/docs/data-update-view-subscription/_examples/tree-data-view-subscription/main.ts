import type { GetRowIdParams, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    HighlightChangesModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { TreeDataModule, ViewSubscriptionModule } from 'ag-grid-enterprise';

import { recordSubscribed, recordUnsubscribed, recordUpdates } from './counters';
import type { Holding, ServerMessage } from './fakeSocket';
import { FakeSocket, fetchHoldings, isUnder } from './fakeSocket';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ClientSideRowModelApiModule,
    HighlightChangesModule,
    TreeDataModule,
    ViewSubscriptionModule,
]);

let gridApi: GridApi<Holding>;
const subscribedIds = new Set<string>();
// the subscribed parent rows, by row id, with their route
const subscribedRoutes = new Map<string, string[]>();
const socket = new FakeSocket();

const gridOptions: GridOptions<Holding> = {
    columnDefs: [
        { field: 'price', enableCellChangeFlash: true },
        { field: 'shares' },
        // region and sector rows show the total value of the stocks under them
        {
            field: 'value',
            aggFunc: 'sum',
            valueFormatter: (params) => params.value?.toFixed(2) ?? '',
            enableCellChangeFlash: true,
        },
    ],
    defaultColDef: { flex: 1 },
    autoGroupColumnDef: { headerName: 'Portfolio', minWidth: 250 },
    treeData: true,
    // the grid creates the region and sector rows from each stock's path
    getDataPath: (data) => data.path,
    groupDefaultExpanded: -1,
    getRowId: (params: GetRowIdParams<Holding>) => params.data.id,
    viewSubscription: {
        subscribeRows: (rows) => {
            const ids: string[] = [];
            const routes: string[][] = [];
            for (const row of rows) {
                if (row.type === 'tree' && row.hasChildren) {
                    // a parent row aggregates every stock under it, so the server streams all of them
                    subscribedRoutes.set(row.id, row.route!);
                    routes.push(row.route!);
                } else {
                    subscribedIds.add(row.id);
                    ids.push(row.id);
                }
            }
            socket.send({ type: 'subscribe', ids });
            socket.send({ type: 'subscribeRoutes', routes });
            recordSubscribed(subscribedIds.size + subscribedRoutes.size);
        },
        unsubscribeRows: (rows) => {
            const ids = rows.map((row) => row.id).filter((id) => subscribedIds.delete(id));
            const routes = rows
                .filter((row) => subscribedRoutes.has(row.id))
                .map((row) => {
                    const route = subscribedRoutes.get(row.id)!;
                    subscribedRoutes.delete(row.id);
                    return route;
                });
            socket.send({ type: 'unsubscribe', ids });
            socket.send({ type: 'unsubscribeRoutes', routes });
            recordUnsubscribed(subscribedIds.size + subscribedRoutes.size);
        },
    },
    onGridReady: (params) => {
        socket.onmessage = (message) => onServerMessage(params.api, message);
        params.api.setGridOption('rowData', fetchHoldings());
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

/** Whether the holding is still subscribed, itself or through a parent row. */
function isStreamed(holding: Holding): boolean {
    return subscribedIds.has(holding.id) || [...subscribedRoutes.values()].some((route) => isUnder(holding, route));
}

function onServerMessage(api: GridApi<Holding>, message: ServerMessage) {
    // ignore updates that were already on their way when their rows were unsubscribed
    const update = message.rows.filter(isStreamed);
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
