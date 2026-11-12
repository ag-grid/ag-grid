import type { GetRowIdParams, GridApi, GridOptions, IToolbarItemComp, IToolbarItemParams } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    HighlightChangesModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ToolbarModule, TreeDataModule, ViewSubscriptionModule } from 'ag-grid-enterprise';

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
    ToolbarModule,
    TreeDataModule,
    ViewSubscriptionModule,
]);

const subscribedIds = new Set<string>();
// the subscribed parent rows, by row id, with their route
const subscribedRoutes = new Map<string, string[]>();
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
            renderCount();
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
            renderCount();
        },
    },
    onGridReady: (params) => {
        socket.onmessage = (message) => onServerMessage(params.api, message);
        params.api.setGridOption('rowData', fetchHoldings());
    },
};

/** Whether the holding is still subscribed, itself or through a parent row. */
function isStreamed(holding: Holding): boolean {
    return subscribedIds.has(holding.id) || [...subscribedRoutes.values()].some((route) => isUnder(holding, route));
}

function renderCount() {
    const subscribedCount = document.querySelector('#subscribedCount');
    const updatesSentCount = document.querySelector('#updatesSent');
    // the toolbar can be removed before the grid is destroyed, which unsubscribes the remaining rows
    if (subscribedCount && updatesSentCount) {
        subscribedCount.textContent = String(subscribedIds.size + subscribedRoutes.size);
        updatesSentCount.textContent = String(updatesSent);
    }
}

function onServerMessage(api: GridApi<Holding>, message: ServerMessage) {
    updatesSent += message.rows.length;
    // ignore updates that were already on their way when their rows were unsubscribed
    const update = message.rows.filter(isStreamed);
    if (update.length) {
        api.applyTransactionAsync({ update });
    }
    renderCount();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
