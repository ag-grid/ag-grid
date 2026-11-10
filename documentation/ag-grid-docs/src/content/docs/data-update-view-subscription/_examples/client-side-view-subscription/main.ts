import type {
    GetRowIdParams,
    GridApi,
    GridOptions,
    IAggFuncParams,
    IToolbarItemComp,
    IToolbarItemParams,
    ValueFormatterParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    HighlightChangesModule,
    ModuleRegistry,
    NumberFilterModule,
    RowApiModule,
    TextFilterModule,
    ViewSubscriptionModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { RowGroupingModule, ToolbarModule } from 'ag-grid-enterprise';

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
    RowApiModule,
    RowGroupingModule,
    TextFilterModule,
    ToolbarModule,
    ViewSubscriptionModule,
]);

const subscribed = new Set<string>();
let updatesSent = 0;
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
        { field: 'sector', rowGroup: true, hide: true },
        { field: 'exchange' },
        { field: 'country' },
        { field: 'symbol', filter: 'agTextColumnFilter' },
        // the average price of different stocks means nothing, so group rows leave it blank
        { field: 'price', filter: 'agNumberColumnFilter', valueFormatter: formatNumber, enableCellChangeFlash: true },
        // the group's biggest move, up or down
        {
            field: 'change',
            headerName: 'Change %',
            aggFunc: 'maxAbs',
            valueFormatter: formatNumber,
            enableCellChangeFlash: true,
        },
        // the total shares traded
        { field: 'volume', aggFunc: 'sum', enableCellChangeFlash: true },
    ],
    defaultColDef: { flex: 1, minWidth: 100 },
    groupDefaultExpanded: 1,
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
                toolbarItemParams: { label: 'Updates sent', id: 'updatesSent' },
                alignment: 'right',
            },
        ],
    },
    // custom aggregations, also offered in the column menu
    aggFuncs: { maxAbs: maxAbs, minAbs: minAbs },
    getRowId: (params: GetRowIdParams<Stock>) => params.data.id,
    viewSubscription: {
        // the server streams prices for stocks only, and the grid aggregates the group rows from them
        subscribeRows: (rows) => {
            const ids = rows.filter((row) => row.type === 'leaf').map((row) => row.id);
            ids.forEach((id) => subscribed.add(id));
            socket.send({ type: 'subscribe', ids });
            console.log(`subscribe ${ids.length}`);
            renderCount();
        },
        unsubscribeRows: (rows) => {
            const ids = rows.map((row) => row.id).filter((id) => subscribed.delete(id));
            socket.send({ type: 'unsubscribe', ids });
            console.log(`unsubscribe ${ids.length}`);
            renderCount();
        },
    },
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

function renderCount() {
    const subscribedCount = document.querySelector('#subscribedCount');
    const updatesSentCount = document.querySelector('#updatesSent');
    // the toolbar can be removed before the grid is destroyed, which unsubscribes the remaining rows
    if (subscribedCount && updatesSentCount) {
        subscribedCount.textContent = String(subscribed.size);
        updatesSentCount.textContent = String(updatesSent);
    }
}

function onServerMessage(api: GridApi<Stock>, message: ServerMessage) {
    updatesSent += message.rows.length;
    // ignore updates that were already on their way when their rows were unsubscribed or removed,
    // as new row data removes the rows before the debounced unsubscribe arrives
    const update = message.rows.filter((row) => subscribed.has(row.id) && api.getRowNode(row.id) !== undefined);
    if (update.length) {
        api.applyTransactionAsync({ update });
    }
    renderCount();
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
