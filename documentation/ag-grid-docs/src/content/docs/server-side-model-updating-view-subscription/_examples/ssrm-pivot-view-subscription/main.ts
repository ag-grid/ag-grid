import type {
    ColDef,
    ColumnPivotModeChangedEvent,
    ColumnValueChangedEvent,
    ColumnVisibleEvent,
    GetRowIdParams,
    GridApi,
    GridOptions,
    IServerSideDatasource,
    IServerSideGetRowsParams,
} from 'ag-grid-community';
import {
    ColumnApiModule,
    HighlightChangesModule,
    ModuleRegistry,
    RowApiModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import {
    ColumnsToolPanelModule,
    PivotModule,
    RowGroupingModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
    ViewSubscriptionModule,
} from 'ag-grid-enterprise';

import { recordStreamed, recordSubscribed, recordUnsubscribed, recordUpdates } from './counters';
import type { GroupSubscription, ResultRow, ServerMessage } from './fakeSocket';
import { FakeSocket } from './fakeSocket';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ColumnApiModule,
    ColumnsToolPanelModule,
    HighlightChangesModule,
    PivotModule,
    RowApiModule,
    RowGroupingModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
    ViewSubscriptionModule,
]);

let gridApi: GridApi<ResultRow>;
// the subscribed stock rows and group rows, by id, with the parent keys that route a transaction to the row
const subscribed = new Map<string, string[]>();
const subscribedGroups = new Map<string, { parentKeys: string[]; route: string[] }>();
// the server streams only the data a row displays, so streams pause while no column shows it
let stocksStreamed = true;
let groupsStreamed = true;
const STREAMED_FIELDS = ['price', 'change', 'volume'];
// getRows requests waiting for their reply, by request id
const pendingRequests = new Map<number, IServerSideGetRowsParams<ResultRow>>();
let nextRequestId = 0;
const socket = new FakeSocket();

const gridOptions: GridOptions<ResultRow> = {
    columnDefs: [
        { field: 'sector', rowGroup: true, hide: true, enablePivot: true },
        { field: 'exchange', pivot: true, enablePivot: true },
        { field: 'symbol' },
        // the average price of different stocks means nothing, so group rows leave it blank
        { field: 'price', enableCellChangeFlash: true },
        {
            field: 'change',
            headerName: 'Change %',
            // the group's biggest rise, which the server computes
            aggFunc: 'max',
            enableValue: true,
            enableCellChangeFlash: true,
        },
        { field: 'volume', aggFunc: 'sum', enableValue: true, enableCellChangeFlash: true },
    ],
    // the row groups and pivot columns can be changed from the Columns Tool Panel
    defaultColDef: { flex: 1, minWidth: 100, enableRowGroup: true },
    rowModelType: 'serverSide',
    pivotMode: true,
    sideBar: 'columns',
    // the server sends the pivot result fields, and the grid creates a column for each one
    serverSidePivotResultFieldSeparator: '_',
    processPivotResultColDef: processPivotResultColDef,
    getRowId: getRowId,
    viewSubscription: {
        subscribeRows: (rows, params) => {
            const ids: string[] = [];
            const groups: GroupSubscription[] = [];
            for (const row of rows) {
                if (row.type === 'group') {
                    // the server streams every aggregate of the group row, including those scrolled out of view
                    subscribedGroups.set(row.id, { parentKeys: row.parentKeys, route: row.route });
                    groups.push(getGroupQuery(row.id, row.route, params.api));
                } else {
                    subscribed.set(row.id, row.parentKeys);
                    ids.push(row.id);
                }
            }
            if (stocksStreamed && ids.length) {
                socket.send({ type: 'subscribe', ids });
            }
            if (groupsStreamed && groups.length) {
                socket.send({ type: 'subscribeGroups', groups });
            }
            recordSubscribed(rows.length, subscribed.size + subscribedGroups.size);
        },
        unsubscribeRows: (rows) => {
            const ids = rows.map((row) => row.id).filter((id) => subscribed.delete(id));
            const groupIds = rows.map((row) => row.id).filter((id) => subscribedGroups.delete(id));
            socket.send({ type: 'unsubscribe', ids });
            socket.send({ type: 'unsubscribeGroups', ids: groupIds });
            recordUnsubscribed(ids.length + groupIds.length, subscribed.size + subscribedGroups.size);
        },
    },
    // the columns shown decide which streams are needed
    onColumnValueChanged: onColumnValueChanged,
    onColumnVisible: onColumnVisible,
    onColumnPivotModeChanged: onColumnPivotModeChanged,
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

function processPivotResultColDef(colDef: ColDef<ResultRow>) {
    colDef.enableCellChangeFlash = true;
}

/** A stock row has its own id. A group row has none, so its id is its route, which is stable across reloads. */
function getRowId(params: GetRowIdParams<ResultRow>): string {
    const { data, parentKeys = [], level, api } = params;
    if (data.id != null) {
        return String(data.id);
    }
    const groupField = api.getRowGroupColumns()[level]?.getColDef().field;
    return ['group', ...parentKeys, String(data[groupField!])].join('/');
}

/** What the server needs to compute a group row: the grouped fields down to the row, and the pivot and value columns. */
function getGroupQuery(id: string, route: string[], api: GridApi<ResultRow>): GroupSubscription {
    const field = (column: { getColDef(): ColDef }) => column.getColDef().field!;
    return {
        id,
        groupFields: api.getRowGroupColumns().map(field),
        groupKeys: route,
        pivotFields: api.isPivotMode() ? api.getPivotColumns().map(field) : [],
        valueCols: api
            .getValueColumns()
            .map((column) => ({ field: field(column), aggFunc: String(column.getAggFunc()) })),
    };
}

function createDatasource(): IServerSideDatasource<ResultRow> {
    return {
        getRows: (params) => {
            const requestId = nextRequestId++;
            pendingRequests.set(requestId, params);
            socket.send({ type: 'getRows', requestId, request: params.request });
        },
    };
}

/** Whether a stock row shows any of the fields the server streams. */
function hasDisplayedStreamedColumns(api: GridApi<ResultRow>): boolean {
    return STREAMED_FIELDS.some((field) => api.getColumn(field)?.isVisible());
}

/**
 * Whether a group row shows any aggregate. In pivot mode every value column is shown through the pivot result columns,
 * otherwise only the visible value columns are.
 */
function hasDisplayedValueColumns(api: GridApi<ResultRow>): boolean {
    const valueColumns = api.getValueColumns();
    return api.isPivotMode() ? valueColumns.length > 0 : valueColumns.some((column) => column.isVisible());
}

/** Pauses the streams no displayed column needs, and resumes them once one does. The rows stay subscribed meanwhile. */
function updateStreams(api: GridApi<ResultRow>) {
    const nextStocksStreamed = hasDisplayedStreamedColumns(api);
    if (nextStocksStreamed !== stocksStreamed) {
        stocksStreamed = nextStocksStreamed;
        const ids = [...subscribed.keys()];
        socket.send(stocksStreamed ? { type: 'subscribe', ids } : { type: 'unsubscribe', ids });
    }
    const nextGroupsStreamed = hasDisplayedValueColumns(api);
    if (nextGroupsStreamed !== groupsStreamed) {
        groupsStreamed = nextGroupsStreamed;
        if (groupsStreamed) {
            const groups = [...subscribedGroups].map(([id, { route }]) => getGroupQuery(id, route, api));
            socket.send({ type: 'subscribeGroups', groups });
        } else {
            socket.send({ type: 'unsubscribeGroups', ids: [...subscribedGroups.keys()] });
        }
    }
}

function onColumnValueChanged(event: ColumnValueChangedEvent<ResultRow>) {
    updateStreams(event.api);
}

function onColumnVisible(event: ColumnVisibleEvent<ResultRow>) {
    updateStreams(event.api);
}

function onColumnPivotModeChanged(event: ColumnPivotModeChangedEvent<ResultRow>) {
    updateStreams(event.api);
}

function onServerMessage(api: GridApi<ResultRow>, message: ServerMessage) {
    if (message.type === 'rows') {
        const { requestId, rowData, rowCount, pivotResultFields } = message;
        pendingRequests.get(requestId)?.success({ rowData, rowCount, pivotResultFields });
        pendingRequests.delete(requestId);
        return;
    }
    if (message.type === 'status') {
        // the server reports how many rows it streams, as it pauses the streams no displayed column needs
        recordStreamed(message.streamedRows);
        return;
    }

    let updates = 0;
    // ignore updates that were already on their way when their rows were unsubscribed or reloaded
    for (const stock of message.stocks) {
        const route = subscribed.get(stock.id);
        if (stocksStreamed && route && api.getRowNode(stock.id)) {
            api.applyServerSideTransactionAsync({ route, update: [stock] });
            updates++;
        }
    }
    for (const { id, row } of message.groups) {
        const group = subscribedGroups.get(id);
        if (groupsStreamed && group && api.getRowNode(id)) {
            api.applyServerSideTransactionAsync({ route: group.parentKeys, update: [row] });
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
