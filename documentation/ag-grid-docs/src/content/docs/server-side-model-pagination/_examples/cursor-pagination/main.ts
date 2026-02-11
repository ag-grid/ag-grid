import type {
    GridApi,
    GridOptions,
    IDetailCellRendererParams,
    IServerSideDatasource,
    IServerSideGetRowsParams,
} from 'ag-grid-community';
import {
    ModuleRegistry,
    NumberFilterModule,
    PaginationModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    MasterDetailModule,
    RowGroupingModule,
    SideBarModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
} from 'ag-grid-enterprise';

import type { IOlympicData } from './interfaces';
import { FakeServer } from './fakeServer';

ModuleRegistry.registerModules([
    PaginationModule,
    TextFilterModule,
    NumberFilterModule,
    ColumnsToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    SideBarModule,
    RowGroupingModule,
    ServerSideRowModelModule,
    ServerSideRowModelApiModule,
    MasterDetailModule,
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
        { field: 'country' },
        {
            field: 'athlete',
            minWidth: 190,
            filter: 'agTextColumnFilter',
        },
        { field: 'gold', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
        { field: 'silver', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
        { field: 'bronze', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
    ],
    defaultColDef: { flex: 1, minWidth: 90, sortable: true },
    autoGroupColumnDef: { field: 'athlete', flex: 1, minWidth: 180 },

    rowModelType: 'serverSide',
    masterDetail: true,
    detailRowHeight: 180,
    isRowMaster: (data) => !!data,
    detailCellRendererParams: (params: IDetailCellRendererParams<IOlympicData, IOlympicData>) => {
        const rowData = params.data ? [params.data] : [];

        return {
            detailGridOptions: {
                rowModelType: 'serverSide',
                columnDefs: [
                    { field: 'athlete' },
                    { field: 'country' },
                    { field: 'year' },
                    { field: 'sport', minWidth: 140 },
                    { field: 'gold' },
                    { field: 'silver' },
                    { field: 'bronze' },
                ],
                defaultColDef: { flex: 1, minWidth: 90, sortable: true },
                onGridReady: (detailParams) => {
                    const datasource: IServerSideDatasource = {
                        getRows: (ssParams: IServerSideGetRowsParams) => {
                            ssParams.success({
                                rowData,
                                rowCount: rowData.length,
                            });
                        },
                    };
                    detailParams.api.setGridOption('serverSideDatasource', datasource);
                },
            },
        };
    },

    // Keep SSRM, but do NOT rely on AG Grid's pagination UI.
    // Hide it via CSS in the HTML snippet below.
    pagination: true,
    paginationAutoPageSize: true,

    sideBar: {
        toolPanels: ['columns'],
        defaultToolPanel: 'columns',
    },

    suppressAggFuncInHeader: true,
};

function getServerSideDatasource(server: any): IServerSideDatasource {
    return {
        getRows: (params) => {
            // NOTE: We ignore startRow/endRow as "page number".
            // We only use them to infer a limit/pageSize.
            const { startRow, endRow, groupKeys } = params.request;
            const limit = Math.max(1, (endRow ?? 0) - (startRow ?? 0));
            const isCursorRequest = (groupKeys?.length ?? 0) === 0;

            console.log('[Datasource] request:', params.request);
            console.log('[Cursor] currentCursor:', cursorState.currentCursor, 'limit:', limit);

            setLoading(true);

            const response = server.getData({
                ...params.request,
                ...(isCursorRequest ? { limit, cursor: cursorState.currentCursor } : {}),
            });

            setTimeout(() => {
                if (!response.success) {
                    params.fail();
                    setLoading(false);
                    return;
                }

                // FakeServer should return:
                // { rows, lastRow, nextCursor, prevCursor, success: true }
                if (isCursorRequest) {
                    cursorState.nextCursor = response.nextCursor ?? null;
                    cursorState.prevCursor = response.prevCursor ?? null;
                }

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
