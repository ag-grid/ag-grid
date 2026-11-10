import type {
    GetRowIdParams,
    GridApi,
    GridOptions,
    IServerSideDatasource,
    IServerSideGetRowsParams,
    IToolbarItemComp,
    IToolbarItemParams,
} from 'ag-grid-community';
import {
    HighlightChangesModule,
    ModuleRegistry,
    ViewSubscriptionModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import {
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
    ToolbarModule,
    TreeDataModule,
} from 'ag-grid-enterprise';

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
    ToolbarModule,
    TreeDataModule,
    ViewSubscriptionModule,
]);

// the parent keys of each subscribed row, which are the route to the store that holds it
const subscribed = new Map<string, string[]>();
// getRows requests waiting for their reply, by request id
const pendingRequests = new Map<number, IServerSideGetRowsParams<PortfolioRow>>();
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
    toolbar: {
        items: [
            { toolbarItem: SubscriptionToggleToolbarItem },
            'separator',
            { label: 'Purge', action: (params) => params.api.refreshServerSide({ purge: true }) },
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
    getRowId: (params: GetRowIdParams<PortfolioRow>) => params.data.id,
    viewSubscription: {
        // the server streams the price and value of a stock row, and the total value of a region or sector row
        subscribeRows: (rows) => {
            rows.forEach((row) => subscribed.set(row.id, row.parentKeys));
            socket.send({ type: 'subscribe', ids: rows.map((row) => row.id) });
            console.log(`subscribe ${rows.length}`);
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
        params.api.setGridOption('serverSideDatasource', createDatasource());
    },
};

function createDatasource(): IServerSideDatasource<PortfolioRow> {
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

function onServerMessage(api: GridApi<PortfolioRow>, message: ServerMessage) {
    if (message.type === 'rows') {
        const { requestId, rowData, rowCount } = message;
        pendingRequests.get(requestId)?.success({ rowData, rowCount });
        pendingRequests.delete(requestId);
        return;
    }

    updatesSent += message.rows.length;
    // rows unsubscribed while an update was on its way are no longer in the map, so are skipped
    for (const row of message.rows) {
        const route = subscribed.get(row.id);
        if (route) {
            api.applyServerSideTransactionAsync({ route, update: [row] });
        }
    }
    renderCount();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
