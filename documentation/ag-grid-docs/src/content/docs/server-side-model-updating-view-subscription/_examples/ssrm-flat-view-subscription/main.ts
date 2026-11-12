import type {
    GetRowIdParams,
    GridApi,
    GridOptions,
    IServerSideDatasource,
    IServerSideGetRowsParams,
    IToolbarItemComp,
    IToolbarItemParams,
} from 'ag-grid-community';
import { HighlightChangesModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import {
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
    ToolbarModule,
    ViewSubscriptionModule,
} from 'ag-grid-enterprise';

import type { ServerMessage, Stock } from './fakeSocket';
import { FakeSocket } from './fakeSocket';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    HighlightChangesModule,
    ServerSideRowModelModule,
    ServerSideRowModelApiModule,
    ToolbarModule,
    ViewSubscriptionModule,
]);

const subscribed = new Set<string>();
// getRows requests waiting for their reply, by request id
const pendingRequests = new Map<number, IServerSideGetRowsParams<Stock>>();
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

const gridOptions: GridOptions<Stock> = {
    columnDefs: [
        { field: 'symbol' },
        { field: 'exchange' },
        { field: 'country' },
        { field: 'price', enableCellChangeFlash: true },
        { field: 'change', headerName: 'Change %', enableCellChangeFlash: true },
        { field: 'volume', enableCellChangeFlash: true },
    ],
    // the server returns the stocks in a fixed order
    defaultColDef: { flex: 1, minWidth: 100, sortable: false },
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
    getRowId: (params: GetRowIdParams<Stock>) => params.data.id,
    viewSubscription: {
        subscribeRows: (rows) => {
            const ids = rows.map((row) => row.id);
            ids.forEach((id) => subscribed.add(id));
            socket.send({ type: 'subscribe', ids });
            renderCount();
        },
        unsubscribeRows: (rows) => {
            const ids = rows.map((row) => row.id);
            ids.forEach((id) => subscribed.delete(id));
            socket.send({ type: 'unsubscribe', ids });
            renderCount();
        },
    },
    onGridReady: (params) => {
        socket.onmessage = (message) => onServerMessage(params.api, message);
        params.api.setGridOption('serverSideDatasource', createDatasource());
    },
};

function createDatasource(): IServerSideDatasource<Stock> {
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
        subscribedCount.textContent = String(subscribed.size);
        updatesSentCount.textContent = String(updatesSent);
    }
}

function onServerMessage(api: GridApi<Stock>, message: ServerMessage) {
    if (message.type === 'rows') {
        const { requestId, rowData, rowCount } = message;
        pendingRequests.get(requestId)?.success({ rowData, rowCount });
        pendingRequests.delete(requestId);
        return;
    }

    updatesSent += message.rows.length;
    // ignore updates that were already on their way when their rows were unsubscribed
    const update = message.rows.filter((row) => subscribed.has(row.id));
    if (update.length) {
        api.applyServerSideTransactionAsync({ update });
    }
    renderCount();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
