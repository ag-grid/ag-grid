import type {
    GetRowIdParams,
    GridApi,
    GridOptions,
    IServerSideDatasource,
    IServerSideGetRowsParams,
} from 'ag-grid-community';
import {
    GRAND_TOTAL_ROW_ID,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { FakeServer } from './fakeServer';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    NumberFilterModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
    TextFilterModule,
]);

type OlympicRow = IOlympicData & { id: string };

let gridApi: GridApi<OlympicRow>;
let fakeServer: ReturnType<typeof FakeServer>;

// Counter identifying the latest in-flight grand-total request. On arrival each fetch checks its
// captured id against the counter; if it's been superseded by a newer request (e.g. a second
// filter change before the first fetch returned), the stale response is discarded.
let latestGrandTotalRequestId = 0;

const gridOptions: GridOptions<OlympicRow> = {
    columnDefs: [
        { field: 'athlete', minWidth: 170 },
        { field: 'country' },
        { field: 'sport' },
        { field: 'year', filter: 'agNumberColumnFilter', floatingFilter: true },
        // aggFunc on a flat grid has no client-side effect, but the SSRM request's valueCols
        // carries it to the server so our grand-total fetch uses the right aggregation.
        { field: 'gold', aggFunc: 'sum', filter: 'agNumberColumnFilter', floatingFilter: true },
        { field: 'silver', aggFunc: 'sum', filter: 'agNumberColumnFilter', floatingFilter: true },
        { field: 'bronze', aggFunc: 'sum', filter: 'agNumberColumnFilter', floatingFilter: true },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 120,
    },
    rowModelType: 'serverSide',
    grandTotalRow: 'bottom',
    cacheBlockSize: 20,
    getRowId: (params: GetRowIdParams<OlympicRow>) => params.data.id,
};

function getServerSideDatasource(server: ReturnType<typeof FakeServer>): IServerSideDatasource {
    return {
        getRows: (params) => {
            console.log('[Datasource] - rows requested:', params.request);

            const response = server.getData(params.request, false);
            const needsGrandTotal = params.needsGrandTotal;

            setTimeout(() => {
                if (!response.success) {
                    params.fail();
                    return;
                }

                // grandTotalData is deliberately omitted here — the async refresh below owns it.
                params.success({
                    rowData: response.rows,
                    rowCount: response.lastRow,
                });

                // `refreshGrandTotalAsync`'s first act is a `remove` transaction, which sets
                // store.grandTotalData = null. The grid treats null as "explicitly cleared" so
                // `needsGrandTotal` stays false for subsequent block requests in the same store
                // — this branch fires exactly once per logical query.
                if (needsGrandTotal) {
                    void refreshGrandTotalAsync(params);
                }
            }, 800);
        },
    };
}

async function refreshGrandTotalAsync(params: IServerSideGetRowsParams<OlympicRow>) {
    const { api, request } = params;
    const thisRequestId = ++latestGrandTotalRequestId;
    console.log(`[GrandTotal] - request ${thisRequestId} started`);

    // Clear the stale total immediately; we'll add the fresh one back when the fetch resolves.
    api.applyServerSideTransaction({
        remove: [{ id: GRAND_TOTAL_ROW_ID } as any],
    });

    // Simulate a separate, backend call for the grand total.
    const grandTotalData = await new Promise<OlympicRow>((resolve) => {
        setTimeout(() => {
            resolve(fakeServer.getData(request, true).grandTotalData);
        }, 1300);
    });

    if (thisRequestId !== latestGrandTotalRequestId) {
        console.log(`[GrandTotal] - request ${thisRequestId} ignored (superseded by ${latestGrandTotalRequestId})`);
        return;
    }

    api.applyServerSideTransaction({ add: [grandTotalData] });
    console.log(`[GrandTotal] - request ${thisRequestId} applied`);
}

document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then(function (data: IOlympicData[]) {
            // Olympic rows aren't unique by athlete/country/year/sport, so a composite natural
            // key collides. Index-based ids guarantee uniqueness.
            const dataWithIds: OlympicRow[] = data.map((row, i) => ({ ...row, id: `row-${i}` }));
            fakeServer = new FakeServer(dataWithIds);
            gridApi!.setGridOption('serverSideDatasource', getServerSideDatasource(fakeServer));
        });
});
