import type {
    ColDef,
    GetRowIdParams,
    GridApi,
    GridOptions,
    IServerSideDatasource,
    ServerSideTransactionResult,
} from 'ag-grid-community';
import { HighlightChangesModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { FakeServer } from './fakeServer';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    HighlightChangesModule,
    RowGroupingModule,
    ServerSideRowModelModule,
    ServerSideRowModelApiModule,
]);

const columnDefs: ColDef[] = [
    { field: 'portfolio', rowGroup: true, hide: true },
    { field: 'tradeId' },
    { field: 'product' },
    { field: 'current' },
    { field: 'version' },
];

const server = new FakeServer();
let feed: any;
let appliedCount = 0;
let staleCount = 0;

let gridApi: GridApi;

const datasource: IServerSideDatasource = {
    getRows: (params) => {
        // responses take a while, so changes can arrive while groups are loading
        setTimeout(() => {
            const response = server.getRows(params.request);
            params.success({ rowData: response.rows, rowCount: response.rowCount, dataVersion: response.version });
        }, 200);
    },
};

const gridOptions: GridOptions = {
    columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        enableCellChangeFlash: true,
    },
    autoGroupColumnDef: {
        minWidth: 220,
    },
    rowModelType: 'serverSide',
    serverSideDatasource: datasource,
    serverSideDataVersionMode: 'stream',
    isServerSideGroupOpenByDefault: () => true,
    getRowId: (params: GetRowIdParams) => {
        if (params.level === 0) {
            return params.data.portfolio;
        }
        return String(params.data.tradeId);
    },
    onGridReady: () => {
        feed = setInterval(onServerChange, 100);
    },
};

function onServerChange() {
    const { version, trade } = server.changeRandomTrade();
    setText('#serverVersion', version);

    // messages take a variable time to arrive, so they can arrive out of order
    setTimeout(() => {
        gridApi.applyServerSideTransactionAsync(
            { route: [trade.portfolio], version, update: [trade] },
            onTransactionApplied
        );
    }, Math.random() * 2000);
}

function onTransactionApplied(result: ServerSideTransactionResult) {
    appliedCount += result.update?.length ?? 0;
    staleCount += result.unapplied?.length ?? 0;
    setText('#appliedCount', appliedCount);
    setText('#staleCount', staleCount);
    if (result.unapplied) {
        console.log('Skipped stale updates', result.unapplied);
    }
}

function stopFeed() {
    clearInterval(feed);
}

function setText(selector: string, value: number) {
    document.querySelector(selector)!.textContent = String(value);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
