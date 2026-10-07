import type { GetRowIdParams, GridApi, GridOptions, IServerSideDatasource, VisibleRowRef } from 'ag-grid-community';
import {
    HighlightChangesModule,
    ModuleRegistry,
    RowApiModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import {
    RowGroupingModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
    ServerSideRowModelVisibleRowsModule,
} from 'ag-grid-enterprise';

import { FakeServer } from './fakeServer';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    RowApiModule,
    HighlightChangesModule,
    RowGroupingModule,
    ServerSideRowModelModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelVisibleRowsModule,
]);

const subscribed = new Map<string, VisibleRowRef>();
let updatesSent = 0;
let stopSubscription: (() => void) | undefined;
let streamTimer: ReturnType<typeof setInterval> | undefined;

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'athlete' },
        { field: 'year' },
        { field: 'gold', enableCellChangeFlash: true },
    ],
    defaultColDef: { flex: 1 },
    autoGroupColumnDef: { minWidth: 200 },
    rowModelType: 'serverSide',
    cacheBlockSize: 50,
    getRowId: (params: GetRowIdParams) => {
        const { data, parentKeys = [] } = params;
        return data.athlete
            ? [...parentKeys, data.athlete, data.year].join('/')
            : [...parentKeys, data.country].join('/');
    },
};

function renderCount() {
    document.querySelector('#subscribedCount')!.textContent = String(subscribed.size);
    document.querySelector('#updatesSent')!.textContent = String(updatesSent);
}

function addLogEntry(text: string) {
    const log = document.querySelector('#log')!;
    const entry = document.createElement('li');
    entry.textContent = text;
    log.prepend(entry);
    while (log.children.length > 8) {
        log.lastElementChild!.remove();
    }
}

function startSubscription() {
    stopSubscription = gridApi.subscribeToVisibleRows({
        onSubscribe: (rows, params) => {
            rows.forEach((row) => subscribed.set(row.id, row));
            addLogEntry(`subscribe ${rows.length} (${params.reason})`);
            renderCount();
        },
        onUnsubscribe: (rows, params) => {
            rows.forEach((row) => subscribed.delete(row.id));
            addLogEntry(`unsubscribe ${rows.length} (${params.reason})`);
            renderCount();
        },
    });
}

function startStream() {
    streamTimer = setInterval(() => {
        for (const id of subscribed.keys()) {
            const node = gridApi.getRowNode(id);
            if (node && !node.group && node.data) {
                updatesSent++;
                node.updateData({ ...node.data, gold: node.data.gold + 1 });
            }
        }
        renderCount();
    }, 1000);
}

function purge() {
    gridApi.refreshServerSide({ purge: true });
}

function stopStream() {
    clearInterval(streamTimer);
    stopSubscription?.();
    stopSubscription = undefined;
}

const getServerSideDatasource = (server: any): IServerSideDatasource => {
    return {
        getRows: (params) => {
            const response = server.getData(params.request);

            // adding delay to simulate real server call
            setTimeout(() => {
                if (response.success) {
                    params.success({ rowData: response.rows, rowCount: response.lastRow });
                } else {
                    params.fail();
                }
            }, 300);
        },
    };
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then(function (data) {
            const fakeServer = new FakeServer(data);
            gridApi!.setGridOption('serverSideDatasource', getServerSideDatasource(fakeServer));
            startSubscription();
            startStream();
        });
});
