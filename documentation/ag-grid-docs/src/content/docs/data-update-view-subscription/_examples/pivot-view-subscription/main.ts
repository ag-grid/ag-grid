import type {
    ColumnPivotModeChangedEvent,
    ColumnValueChangedEvent,
    ColumnVisibleEvent,
    GetRowIdParams,
    GridApi,
    GridOptions,
    IAggFuncParams,
    IToolbarItemComp,
    IToolbarItemParams,
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
    ViewSubscriptionModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnsToolPanelModule, PivotModule, RowGroupingModule, ToolbarModule } from 'ag-grid-enterprise';

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
    ToolbarModule,
    ViewSubscriptionModule,
]);

const subscribed = new Set<string>();
// the subscribed group rows, by id, with the stocks each one aggregates
const subscribedGroups = new Map<string, GroupFilter>();
// the server streams only the data a row displays, so streams pause while no column shows it
let stocksStreamed = true;
let groupsStreamed = true;
let updatesSent = 0;
const STREAMED_FIELDS: (keyof Stock)[] = ['price', 'change', 'volume'];
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
    toolbar: {
        items: [
            { toolbarItem: SubscriptionToggleToolbarItem },
            'separator',
            { label: 'New Row Data', action: (params) => resetData(params.api) },
            {
                toolbarItem: CounterToolbarItem,
                toolbarItemParams: { label: 'Subscribed rows', id: 'subscribedCount' },
                alignment: 'right',
            },
            {
                toolbarItem: CounterToolbarItem,
                toolbarItemParams: { label: 'Streamed stocks', id: 'streamedCount' },
                alignment: 'right',
            },
            {
                toolbarItem: CounterToolbarItem,
                toolbarItemParams: { label: 'Updates sent', id: 'updatesSent' },
                alignment: 'right',
            },
        ],
    },
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
            console.log(`subscribe ${rows.length}`);
            renderCount(params.api);
        },
        unsubscribeRows: (rows, params) => {
            const ids = rows.map((row) => row.id).filter((id) => subscribed.delete(id));
            const groupIds = rows.map((row) => row.id).filter((id) => subscribedGroups.delete(id));
            socket.send({ type: 'unsubscribe', ids });
            socket.send({ type: 'unsubscribeGroups', ids: groupIds });
            console.log(`unsubscribe ${ids.length + groupIds.length}`);
            renderCount(params.api);
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
};

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
    renderCount(api);
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

function renderCount(api: GridApi<Stock>) {
    const subscribedCount = document.querySelector('#subscribedCount');
    const streamedCount = document.querySelector('#streamedCount');
    const updatesSentCount = document.querySelector('#updatesSent');
    // the toolbar can be removed before the grid is destroyed, which unsubscribes the remaining rows
    if (subscribedCount && streamedCount && updatesSentCount) {
        subscribedCount.textContent = String(subscribed.size + subscribedGroups.size);
        streamedCount.textContent = String(countStreamedStocks(api));
        updatesSentCount.textContent = String(updatesSent);
    }
}

function onServerMessage(api: GridApi<Stock>, message: ServerMessage) {
    updatesSent += message.rows.length;
    // ignore updates that were already on their way when their rows, or the groups holding them, were unsubscribed.
    // A group row keeps its id when new row data arrives, so also skip stocks the new row data replaced
    const update = message.rows.filter((row) => isStreamed(row) && api.getRowNode(row.id) !== undefined);
    if (update.length) {
        api.applyTransactionAsync({ update });
    }
    renderCount(api);
}

function resetData(api: GridApi<Stock>) {
    // apply the queued updates while their stocks are still in the grid
    api.flushAsyncTransactions();
    api.setGridOption('rowData', fetchStocks());
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
