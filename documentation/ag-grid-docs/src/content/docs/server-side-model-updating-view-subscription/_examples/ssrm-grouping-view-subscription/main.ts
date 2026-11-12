import type {
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
import { HighlightChangesModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import {
    RowGroupingModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
    ToolbarModule,
    ViewSubscriptionModule,
} from 'ag-grid-enterprise';

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
    ToolbarModule,
    ViewSubscriptionModule,
]);

// the subscribed stock rows, by id, with the parent keys that route a transaction to the row
const subscribedStocks = new Map<string, string[]>();
// the subscribed sector group rows, by sector
const subscribedSectors = new Set<string>();
// getRows requests waiting for their reply, by request id
const pendingRequests = new Map<number, IServerSideGetRowsParams<Row>>();
let nextRequestId = 0;
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
                toolbarItemParams: { label: 'Updates sent', id: 'updatesSent' },
                alignment: 'right',
            },
        ],
    },
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
            renderCount();
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
            renderCount();
        },
    },
    onGridReady: (params) => {
        socket.onmessage = (message) => onServerMessage(params.api, message);
        params.api.setGridOption('serverSideDatasource', createDatasource());
    },
};

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

function renderCount() {
    const subscribedCount = document.querySelector('#subscribedCount');
    const updatesSentCount = document.querySelector('#updatesSent');
    // the toolbar can be removed before the grid is destroyed, which unsubscribes the remaining rows
    if (subscribedCount && updatesSentCount) {
        subscribedCount.textContent = String(subscribedStocks.size + subscribedSectors.size);
        updatesSentCount.textContent = String(updatesSent);
    }
}

function onServerMessage(api: GridApi<Row>, message: ServerMessage) {
    if (message.type === 'rows') {
        const { requestId, rowData, rowCount } = message;
        pendingRequests.get(requestId)?.success({ rowData, rowCount });
        pendingRequests.delete(requestId);
        return;
    }

    updatesSent += message.stocks.length + message.sectors.length;
    // ignore updates that were already on their way when their rows were unsubscribed
    for (const stock of message.stocks) {
        const route = subscribedStocks.get(stock.id);
        if (route) {
            api.applyServerSideTransactionAsync({ route, update: [stock] });
        }
    }
    const sectors = message.sectors.filter((row) => subscribedSectors.has(row.sector));
    if (sectors.length) {
        // the sector rows are at the top level, so the route is empty
        api.applyServerSideTransactionAsync({ route: [], update: sectors });
    }
    renderCount();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
