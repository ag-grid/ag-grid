import type { GridApi, GridOptions, IServerSideDatasource } from 'ag-grid-community';
import { ModuleRegistry, PaginationModule, ValidationModule, createGrid } from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    RowGroupingModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
} from 'ag-grid-enterprise';

import type { IOlympicData } from './interfaces';
import { FakeServer } from './fakeServer';

ModuleRegistry.registerModules([
    PaginationModule,
    ColumnsToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    RowGroupingModule,
    ServerSideRowModelModule,
    ServerSideRowModelApiModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IOlympicData>;

/**
 * Cursor state stored OUTSIDE the grid.
 * - currentCursor determines which "page" to fetch
 * - nextCursor/prevCursor come from the server response
 * - this example wraps cursors so Next/Previous are always available
 *
 * For APIs that don't return `prevCursor`, you can maintain your own history stack instead.
 */
const cursorState: {
    currentCursor: string | null;
    nextCursor: string | null;
    prevCursor: string | null;
} = {
    currentCursor: null,
    nextCursor: null,
    prevCursor: null,
};

function setLoading(isLoading: boolean) {
    const prevBtn = document.querySelector<HTMLButtonElement>('#prevBtn')!;
    const nextBtn = document.querySelector<HTMLButtonElement>('#nextBtn')!;
    const status = document.querySelector<HTMLElement>('#status')!;

    prevBtn.disabled = isLoading || !cursorState.prevCursor;
    nextBtn.disabled = isLoading || !cursorState.nextCursor;

    status.textContent = isLoading ? 'Loading...' : '';
}

function updateNavButtons() {
    const prevBtn = document.querySelector<HTMLButtonElement>('#prevBtn')!;
    const nextBtn = document.querySelector<HTMLButtonElement>('#nextBtn')!;

    prevBtn.disabled = !cursorState.prevCursor;
    nextBtn.disabled = !cursorState.nextCursor;
}

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'athlete', minWidth: 190 },
        { field: 'gold', aggFunc: 'sum' },
        { field: 'silver', aggFunc: 'sum' },
        { field: 'bronze', aggFunc: 'sum' },
    ],
    defaultColDef: { flex: 1, minWidth: 90 },
    autoGroupColumnDef: { flex: 1, minWidth: 180 },

    rowModelType: 'serverSide',

    // Keep SSRM, but do NOT rely on AG Grid's pagination UI.
    // Hide it via CSS in the HTML snippet below.
    pagination: true,
    paginationAutoPageSize: true,

    suppressAggFuncInHeader: true,
};

function getServerSideDatasource(server: any): IServerSideDatasource {
    return {
        getRows: (params) => {
            // NOTE: We ignore startRow/endRow as "page number".
            // We only use them to infer a limit/pageSize.
            const { startRow, endRow } = params.request;
            const limit = Math.max(1, (endRow ?? 0) - (startRow ?? 0));

            console.log('[Datasource] request:', params.request);
            console.log('[Cursor] currentCursor:', cursorState.currentCursor, 'limit:', limit);

            setLoading(true);

            const response = server.getData({
                ...params.request,
                limit,
                cursor: cursorState.currentCursor,
            });

            setTimeout(() => {
                if (!response.success) {
                    params.fail();
                    setLoading(false);
                    return;
                }

                // FakeServer should return:
                // { rows, lastRow, nextCursor, prevCursor, success: true }
                cursorState.nextCursor = response.nextCursor ?? null;
                cursorState.prevCursor = response.prevCursor ?? null;

                params.success({
                    rowData: response.rows,
                    // Cursor pagination typically doesn't know total row count; -1 means "unknown"
                    rowCount: response.lastRow ?? -1,
                });

                setLoading(false);
                updateNavButtons();
            }, 200);
        },
    };
}

function goNext() {
    if (!cursorState.nextCursor) return;
    cursorState.currentCursor = cursorState.nextCursor;
    gridApi.refreshServerSide({ purge: true });
}

function goPrev() {
    if (!cursorState.prevCursor) return;
    cursorState.currentCursor = cursorState.prevCursor;
    gridApi.refreshServerSide({ purge: true });
}

function resetToFirstPage() {
    cursorState.currentCursor = null;
    cursorState.nextCursor = null;
    cursorState.prevCursor = null;
    gridApi.refreshServerSide({ purge: true });
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    document.querySelector<HTMLButtonElement>('#prevBtn')!.addEventListener('click', goPrev);
    document.querySelector<HTMLButtonElement>('#nextBtn')!.addEventListener('click', goNext);
    document.querySelector<HTMLButtonElement>('#resetBtn')!.addEventListener('click', resetToFirstPage);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data) => {
            const fakeServer = new FakeServer(data.filter((r: any) => r.country !== 'Russia'));
            const datasource = getServerSideDatasource(fakeServer);
            gridApi.setGridOption('serverSideDatasource', datasource);

            // Initial load (cursorState.currentCursor === null)
            updateNavButtons();
        });
});
