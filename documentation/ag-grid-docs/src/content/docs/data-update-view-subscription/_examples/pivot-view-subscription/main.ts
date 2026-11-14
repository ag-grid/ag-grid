import type {
    ColumnPivotModeChangedEvent,
    ColumnValueChangedEvent,
    ColumnVisibleEvent,
    GetRowIdParams,
    GridApi,
    GridOptions,
    IAggFuncParams,
    ValueFormatterParams,
    ViewGroupRowRef,
} from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    HighlightChangesModule,
    ModuleRegistry,
    NumberFilterModule,
    RowApiModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnsToolPanelModule, PivotModule, RowGroupingModule, ViewSubscriptionModule } from 'ag-grid-enterprise';

import { recordStreamed, recordSubscribed, recordUnsubscribed, recordUpdates } from './counters';
import type { GroupFilter, ServerMessage, Stock } from './fakeSocket';
import { FakeSocket, fetchStocks, isInGroup } from './fakeSocket';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ClientSideRowModelApiModule,
    ColumnApiModule,
    ColumnsToolPanelModule,
    HighlightChangesModule,
    NumberFilterModule,
    PivotModule,
    RowApiModule,
    RowGroupingModule,
    TextFilterModule,
    ViewSubscriptionModule,
]);

let gridApi: GridApi<Stock>;
const subscribed = new Set<string>();
// the subscribed group rows, by id, with the stocks each one aggregates
const subscribedGroups = new Map<string, GroupFilter>();
// the server streams only the data a row displays, so streams pause while no column shows it
let stocksStreamed = true;
let groupsStreamed = true;
const STREAMED_FIELDS: (keyof Stock)[] = ['price', 'change', 'volume'];
const socket = new FakeSocket();

const gridOptions: GridOptions<Stock> = {
    columnDefs: [
        { field: 'sector', rowGroup: true, hide: true, enablePivot: true },
        { field: 'exchange', pivot: true, enablePivot: true },
        { field: 'symbol', filter: 'agTextColumnFilter' },
        {
            field: 'price',
            filter: 'agNumberColumnFilter',
            // the average price of different stocks means nothing, so group rows leave it blank
            valueFormatter: formatNumber,
            enableCellChangeFlash: true,
        },
        {
            field: 'change',
            headerName: 'Change %',
            // the group's biggest move, up or down
            aggFunc: 'maxAbs',
            enableValue: true,
            valueFormatter: formatNumber,
            enableCellChangeFlash: true,
        },
        // the total shares traded
        { field: 'volume', aggFunc: 'sum', enableValue: true, enableCellChangeFlash: true },
    ],
    // the row groups and pivot columns can be changed from the Columns Tool Panel
    defaultColDef: { flex: 1, minWidth: 100, enableRowGroup: true },
    pivotMode: true,
    sideBar: 'columns',
    // custom aggregations, also offered in the column menu
    aggFuncs: { maxAbs: maxAbs, minAbs: minAbs },
    getRowId: (params: GetRowIdParams<Stock>) => params.data.id,
    viewSubscription: {
        subscribeRows: (rows, params) => {
            const ids: string[] = [];
            const groups: ({ id: string } & GroupFilter)[] = [];
            for (const row of rows) {
                if (row.type === 'group') {
                    // the grid aggregates a group row from its stocks, so the server streams every stock in the group
                    const group = { id: row.id, ...getGroupFilter(row, params.api) };
                    subscribedGroups.set(row.id, group);
                    groups.push(group);
                } else {
                    subscribed.add(row.id);
                    ids.push(row.id);
                }
            }
            if (stocksStreamed) {
                socket.send({ type: 'subscribe', ids });
            }
            if (groupsStreamed) {
                socket.send({ type: 'subscribeGroups', groups });
            }
            recordSubscribed(rows.length, subscribed.size + subscribedGroups.size);
            recordStreamed(() => countStreamedStocks(params.api));
        },
        unsubscribeRows: (rows, params) => {
            const ids = rows.map((row) => row.id).filter((id) => subscribed.delete(id));
            const groupIds = rows.map((row) => row.id).filter((id) => subscribedGroups.delete(id));
            socket.send({ type: 'unsubscribe', ids });
            socket.send({ type: 'unsubscribeGroups', ids: groupIds });
            recordUnsubscribed(ids.length + groupIds.length, subscribed.size + subscribedGroups.size);
            recordStreamed(() => countStreamedStocks(params.api));
        },
    },
    // the columns shown decide which streams are needed
    onColumnValueChanged: onColumnValueChanged,
    onColumnVisible: onColumnVisible,
    onColumnPivotModeChanged: onColumnPivotModeChanged,
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

/** The value furthest from zero, keeping its sign, so a group shows its biggest move up or down. */
function maxAbs(params: IAggFuncParams<Stock>) {
    return params.values.reduce(
        (result, value) => (result == null || Math.abs(value) > Math.abs(result) ? value : result),
        null
    );
}

/** The value closest to zero, keeping its sign. */
function minAbs(params: IAggFuncParams<Stock>) {
    return params.values.reduce(
        (result, value) => (result == null || Math.abs(value) < Math.abs(result) ? value : result),
        null
    );
}

// the avg aggregate is an object holding the value, other values are numbers
function formatNumber(params: ValueFormatterParams<Stock>) {
    const value = typeof params.value === 'object' ? params.value?.value : params.value;
    return value == null ? '' : value.toFixed(2);
}

/**
 * The grouped fields down to this group row, paired with the row's route. Grouping can change in the Columns Tool Panel.
 * In pivot mode the row is still a row group, and its pivot result columns aggregate every stock in it, so the filter is the same.
 */
function getGroupFilter(row: ViewGroupRowRef, api: GridApi<Stock>): GroupFilter {
    const fields = api
        .getRowGroupColumns()
        .slice(0, row.route.length)
        .map((column) => column.getColDef().field as keyof Stock);
    return { fields, keys: row.route };
}

/** Whether the server streams this stock: it is subscribed, or a subscribed group holds it, and its stream is on. */
function isStreamed(stock: Stock): boolean {
    return (
        (stocksStreamed && subscribed.has(stock.id)) ||
        (groupsStreamed && [...subscribedGroups.values()].some((group) => isInGroup(stock, group)))
    );
}

/** Whether a stock row shows any of the fields the server streams. */
function hasDisplayedStreamedColumns(api: GridApi<Stock>): boolean {
    return STREAMED_FIELDS.some((field) => api.getColumn(field)?.isVisible());
}

/**
 * Whether a group row shows any aggregate. In pivot mode every value column is shown through the pivot result columns,
 * otherwise only the visible value columns are.
 */
function hasDisplayedValueColumns(api: GridApi<Stock>): boolean {
    const valueColumns = api.getValueColumns();
    return api.isPivotMode() ? valueColumns.length > 0 : valueColumns.some((column) => column.isVisible());
}

/** Pauses the streams no displayed column needs, and resumes them once one does. The rows stay subscribed meanwhile. */
function updateStreams(api: GridApi<Stock>) {
    const nextStocksStreamed = hasDisplayedStreamedColumns(api);
    if (nextStocksStreamed !== stocksStreamed) {
        stocksStreamed = nextStocksStreamed;
        const ids = [...subscribed];
        socket.send(stocksStreamed ? { type: 'subscribe', ids } : { type: 'unsubscribe', ids });
    }
    const nextGroupsStreamed = hasDisplayedValueColumns(api);
    if (nextGroupsStreamed !== groupsStreamed) {
        groupsStreamed = nextGroupsStreamed;
        if (groupsStreamed) {
            const groups = [...subscribedGroups].map(([id, group]) => ({ id, ...group }));
            socket.send({ type: 'subscribeGroups', groups });
        } else {
            socket.send({ type: 'unsubscribeGroups', ids: [...subscribedGroups.keys()] });
        }
    }
    recordStreamed(() => countStreamedStocks(api));
}

function onColumnValueChanged(event: ColumnValueChangedEvent<Stock>) {
    updateStreams(event.api);
}

function onColumnVisible(event: ColumnVisibleEvent<Stock>) {
    updateStreams(event.api);
}

function onColumnPivotModeChanged(event: ColumnPivotModeChangedEvent<Stock>) {
    updateStreams(event.api);
}

/** The number of stocks the server streams. A few group rows, such as those in pivot mode, can cover many stocks. */
function countStreamedStocks(api: GridApi<Stock>): number {
    let count = 0;
    api.forEachLeafNode((node) => {
        if (node.data && isStreamed(node.data)) {
            count++;
        }
    });
    return count;
}

function onServerMessage(api: GridApi<Stock>, message: ServerMessage) {
    // ignore updates that were already on their way when their rows, or the groups holding them, were unsubscribed.
    // A group row keeps its id when new row data arrives, so also skip stocks the new row data replaced
    const update = message.rows.filter((row) => isStreamed(row) && api.getRowNode(row.id) !== undefined);
    if (update.length) {
        api.applyTransactionAsync({ update });
    }
    recordUpdates(update.length);
    recordStreamed(() => countStreamedStocks(api));
}

function onNewRowData() {
    // apply the queued updates while their stocks are still in the grid
    gridApi.flushAsyncTransactions();
    gridApi.setGridOption('rowData', fetchStocks());
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
