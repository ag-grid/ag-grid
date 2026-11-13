import type {
    GetRowIdParams,
    GridApi,
    GridOptions,
    IAggFuncParams,
    IServerSideDatasource,
    IServerSideGetRowsParams,
    ValueFormatterParams,
} from 'ag-grid-community';
import { HighlightChangesModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import {
    RowGroupingModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
    ViewSubscriptionModule,
} from 'ag-grid-enterprise';

import { recordSubscribed, recordUnsubscribed, recordUpdates } from './counters';
import type { Row, ServerMessage } from './fakeSocket';
import { FakeSocket } from './fakeSocket';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    HighlightChangesModule,
    RowGroupingModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
    ViewSubscriptionModule,
]);

let gridApi: GridApi<Row>;
// the subscribed stock rows, by id, with the parent keys that route a transaction to the row
const subscribedStocks = new Map<string, string[]>();
// the subscribed sector group rows, by sector
const subscribedSectors = new Set<string>();
// getRows requests waiting for their reply, by request id
const pendingRequests = new Map<number, IServerSideGetRowsParams<Row>>();
let nextRequestId = 0;
const socket = new FakeSocket();

const gridOptions: GridOptions<Row> = {
    columnDefs: [
        { field: 'sector', rowGroup: true, hide: true },
        { field: 'symbol' },
        // the average price of different stocks means nothing, so group rows leave it blank
        { field: 'price', valueFormatter: formatNumber, enableCellChangeFlash: true },
        // the sector's biggest move, up or down, which the server calculates
        {
            field: 'change',
            headerName: 'Change %',
            aggFunc: 'maxAbs',
            valueFormatter: formatNumber,
            enableCellChangeFlash: true,
        },
        { field: 'volume', aggFunc: 'sum', enableCellChangeFlash: true },
    ],
    defaultColDef: { flex: 1, minWidth: 100 },
    autoGroupColumnDef: { minWidth: 200 },
    rowModelType: 'serverSide',
    // the server aggregates the group rows, so the grid only needs to know the name
    aggFuncs: { maxAbs: maxAbs },
    getRowId: getRowId,
    viewSubscription: {
        subscribeRows: (rows) => {
            const ids: string[] = [];
            const sectors: string[] = [];
            for (const row of rows) {
                if (row.type === 'group') {
                    // the server sends the whole group row, recalculated whenever one of its stocks moves
                    subscribedSectors.add(row.route[0]);
                    sectors.push(row.route[0]);
                } else {
                    subscribedStocks.set(row.id, row.parentKeys);
                    ids.push(row.id);
                }
            }
            socket.send({ type: 'subscribe', ids });
            socket.send({ type: 'subscribeSectors', sectors });
            recordSubscribed(rows.length, subscribedStocks.size + subscribedSectors.size);
        },
        unsubscribeRows: (rows) => {
            const ids: string[] = [];
            const sectors: string[] = [];
            for (const row of rows) {
                if (row.type === 'group') {
                    subscribedSectors.delete(row.route[0]);
                    sectors.push(row.route[0]);
                } else {
                    subscribedStocks.delete(row.id);
                    ids.push(row.id);
                }
            }
            socket.send({ type: 'unsubscribe', ids });
            socket.send({ type: 'unsubscribeSectors', sectors });
            recordUnsubscribed(rows.length, subscribedStocks.size + subscribedSectors.size);
        },
    },
    onGridReady: (params) => {
        socket.onmessage = (message) => onServerMessage(params.api, message);
        params.api.setGridOption('serverSideDatasource', createDatasource());
    },
};

function onSubscriptionActiveChanged() {
    const checked = document.querySelector<HTMLInputElement>('#subscriptionActive')!.checked;
    gridApi.setGridOption('viewSubscriptionActive', checked);
}

function formatNumber(params: ValueFormatterParams<Row>) {
    return params.value == null ? '' : Number(params.value).toFixed(2);
}

/** The value furthest from zero, keeping its sign. */
function maxAbs(params: IAggFuncParams<Row>) {
    return params.values.reduce(
        (result, value) => (result == null || Math.abs(value) > Math.abs(result) ? value : result),
        null
    );
}

/** A stock row has its own id. A sector group row has none, so its id comes from its sector. */
function getRowId(params: GetRowIdParams<Row>): string {
    const { data } = params;
    return 'id' in data ? data.id : `sector/${data.sector}`;
}

function createDatasource(): IServerSideDatasource<Row> {
    return {
        getRows: (params) => {
            const requestId = nextRequestId++;
            pendingRequests.set(requestId, params);
            socket.send({ type: 'getRows', requestId, request: params.request });
        },
    };
}

function onServerMessage(api: GridApi<Row>, message: ServerMessage) {
    if (message.type === 'rows') {
        const { requestId, rowData, rowCount } = message;
        pendingRequests.get(requestId)?.success({ rowData, rowCount });
        pendingRequests.delete(requestId);
        return;
    }

    let updates = 0;
    // ignore updates that were already on their way when their rows were unsubscribed
    for (const stock of message.stocks) {
        const route = subscribedStocks.get(stock.id);
        if (route) {
            api.applyServerSideTransactionAsync({ route, update: [stock] });
            updates++;
        }
    }
    const sectors = message.sectors.filter((row) => subscribedSectors.has(row.sector));
    if (sectors.length) {
        // the sector rows are at the top level, so the route is empty
        api.applyServerSideTransactionAsync({ route: [], update: sectors });
    }
    recordUpdates(updates + sectors.length);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
