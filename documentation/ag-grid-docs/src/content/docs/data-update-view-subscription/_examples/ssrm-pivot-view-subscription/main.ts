import type {
    ColDef,
    ColumnPivotModeChangedEvent,
    ColumnValueChangedEvent,
    ColumnVisibleEvent,
    GetRowIdParams,
    GridApi,
    GridOptions,
    IAggFuncParams,
    IServerSideDatasource,
    IServerSideGetRowsParams,
    IToolbarItemComp,
    IToolbarItemParams,
    ValueFormatterParams,
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
    ToolbarModule,
    ViewSubscriptionModule,
} from 'ag-grid-enterprise';

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
    ToolbarModule,
    ViewSubscriptionModule,
]);

// the subscribed stock rows and group rows, by id, with the parent keys that route a transaction to the row
const subscribed = new Map<string, string[]>();
const subscribedGroups = new Map<string, { parentKeys: string[]; route: string[] }>();
// the server streams only the data a row displays, so streams pause while no column shows it
let stocksStreamed = true;
let groupsStreamed = true;
let updatesSent = 0;
// reported by the server, which pauses the streams no displayed column needs
let streamedRows = 0;
const STREAMED_FIELDS = ['price', 'change', 'volume'];
// getRows requests waiting for their reply, by request id
const pendingRequests = new Map<number, IServerSideGetRowsParams<ResultRow>>();
let nextRequestId = 0;
const socket = new FakeSocket();

interface CounterParams {
    label: string;
    // the id of the element holding the count, which renderCount updates
    id: string;
}

/** A toolbar checkbox that turns the subscription on and off, and says which it is. */
class SubscriptionToggleToolbarItem implements IToolbarItemComp {
    private eGui!: HTMLLabelElement;

    init(params: IToolbarItemParams) {
        this.eGui = document.createElement('label');
        this.eGui.className = 'ag-toolbar-item subscription-toggle';
        const eCheckbox = document.createElement('input');
        eCheckbox.type = 'checkbox';
        eCheckbox.checked = params.api.getGridOption('viewSubscriptionActive') !== false;
        const eText = document.createElement('span');
        const render = () => (eText.textContent = eCheckbox.checked ? 'Subscription active' : 'Subscription disabled');
        render();
        eCheckbox.addEventListener('change', () => {
            render();
            params.api.setGridOption('viewSubscriptionActive', eCheckbox.checked);
        });
        this.eGui.append(eCheckbox, eText);
    }

    getGui() {
        return this.eGui;
    }
}

/** A toolbar item that shows a count, as `Label: value`. */
class CounterToolbarItem implements IToolbarItemComp {
    private eGui!: HTMLElement;

    init(params: IToolbarItemParams<any, any, CounterParams>) {
        const { label, id } = params.toolbarItemParams!;
        this.eGui = document.createElement('span');
        this.eGui.className = 'ag-toolbar-item toolbar-counter';
        const eCount = document.createElement('b');
        eCount.id = id;
        eCount.textContent = '0';
        this.eGui.append(`${label}:`, eCount);
    }

    getGui() {
        return this.eGui;
    }
}

const gridOptions: GridOptions<ResultRow> = {
    columnDefs: [
        { field: 'sector', rowGroup: true, hide: true, enablePivot: true },
        { field: 'exchange', pivot: true, enablePivot: true },
        { field: 'symbol' },
        // the average price of different stocks means nothing, so group rows leave it blank
        { field: 'price', valueFormatter: formatNumber, enableCellChangeFlash: true },
        {
            field: 'change',
            headerName: 'Change %',
            // the group's biggest move, up or down, which the server computes
            aggFunc: 'maxAbs',
            enableValue: true,
            valueFormatter: formatNumber,
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
    toolbar: {
        items: [
            { toolbarItem: SubscriptionToggleToolbarItem },
            {
                toolbarItem: CounterToolbarItem,
                toolbarItemParams: { label: 'Subscribed rows', id: 'subscribedCount' },
                alignment: 'right',
            },
            {
                toolbarItem: CounterToolbarItem,
                toolbarItemParams: { label: 'Streamed rows', id: 'streamedCount' },
                alignment: 'right',
            },
            {
                toolbarItem: CounterToolbarItem,
                toolbarItemParams: { label: 'Updates sent', id: 'updatesSent' },
                alignment: 'right',
            },
        ],
    },
    // the server aggregates the rows, so the grid only needs to know the name
    aggFuncs: { maxAbs: maxAbs },
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
            console.log(`subscribe ${rows.length}`);
            renderCount();
        },
        unsubscribeRows: (rows) => {
            const ids = rows.map((row) => row.id).filter((id) => subscribed.delete(id));
            const groupIds = rows.map((row) => row.id).filter((id) => subscribedGroups.delete(id));
            socket.send({ type: 'unsubscribe', ids });
            socket.send({ type: 'unsubscribeGroups', ids: groupIds });
            console.log(`unsubscribe ${ids.length + groupIds.length}`);
            renderCount();
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
};

function formatNumber(params: ValueFormatterParams<ResultRow>) {
    return params.value == null ? '' : Number(params.value).toFixed(2);
}

/** The value furthest from zero, keeping its sign. */
function maxAbs(params: IAggFuncParams<ResultRow>) {
    return params.values.reduce(
        (result, value) => (result == null || Math.abs(value) > Math.abs(result) ? value : result),
        null
    );
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

function renderCount() {
    const subscribedCount = document.querySelector('#subscribedCount');
    const streamedCount = document.querySelector('#streamedCount');
    const updatesSentCount = document.querySelector('#updatesSent');
    // the toolbar can be removed before the grid is destroyed, which unsubscribes the remaining rows
    if (subscribedCount && streamedCount && updatesSentCount) {
        subscribedCount.textContent = String(subscribed.size + subscribedGroups.size);
        streamedCount.textContent = String(streamedRows);
        updatesSentCount.textContent = String(updatesSent);
    }
}

function onServerMessage(api: GridApi<ResultRow>, message: ServerMessage) {
    if (message.type === 'rows') {
        const { requestId, rowData, rowCount, pivotResultFields } = message;
        pendingRequests.get(requestId)?.success({ rowData, rowCount, pivotResultFields });
        pendingRequests.delete(requestId);
        return;
    }
    if (message.type === 'status') {
        streamedRows = message.streamedRows;
        renderCount();
        return;
    }

    updatesSent += message.stocks.length + message.groups.length;
    // ignore updates that were already on their way when their rows were unsubscribed or reloaded
    for (const stock of message.stocks) {
        const route = subscribed.get(stock.id);
        if (stocksStreamed && route && api.getRowNode(stock.id)) {
            api.applyServerSideTransactionAsync({ route, update: [stock] });
        }
    }
    for (const { id, row } of message.groups) {
        const group = subscribedGroups.get(id);
        if (groupsStreamed && group && api.getRowNode(id)) {
            api.applyServerSideTransactionAsync({ route: group.parentKeys, update: [row] });
        }
    }
    renderCount();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
