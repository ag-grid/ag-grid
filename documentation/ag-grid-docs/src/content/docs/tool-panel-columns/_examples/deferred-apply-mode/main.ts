import type { ColDef, GridApi, GridOptions, IServerSideDatasource, IServerSideGetRowsRequest } from 'ag-grid-community';
import { ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    PivotModule,
    ServerSideRowModelModule,
} from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ColumnsToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    PivotModule,
    ServerSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const columnDefs: ColDef[] = [
    { field: 'athlete', minWidth: 180, enableRowGroup: true, enablePivot: true },
    { field: 'age', enableRowGroup: true, enablePivot: true },
    { field: 'country', minWidth: 160, enableRowGroup: true, enablePivot: true },
    { field: 'year', enableRowGroup: true, enablePivot: true },
    { field: 'sport', minWidth: 180, enableRowGroup: true, enablePivot: true },
    { field: 'gold', enableValue: true },
    { field: 'silver', enableValue: true },
    { field: 'bronze', enableValue: true },
    { field: 'total', enableValue: true },
];

let gridApi: GridApi<IOlympicData>;
let requestSequence = 0;

const logColumnStateSnapshot = (source: string) => {
    try {
        if (!gridApi) {
            return;
        }

        const getColIdSafe = (col: any): string => {
            if (!col) {
                return 'unknown';
            }
            if (typeof col.getColId === 'function') {
                return col.getColId();
            }
            if (typeof col.getId === 'function') {
                return col.getId();
            }
            return String(col.colId ?? col.field ?? 'unknown');
        };

        const visibleCols = gridApi.getAllDisplayedColumns().map(getColIdSafe).join(', ');
        const rowGroups = gridApi.getRowGroupColumns().map(getColIdSafe).join(', ');
        const pivots = gridApi.getPivotColumns().map(getColIdSafe).join(', ');
        const values = gridApi.getValueColumns().map(getColIdSafe).join(', ');

        console.log(
            `[CTP Deferred Example] ${source} | pivotMode=${gridApi.isPivotMode()} | visible=[${visibleCols}] | rowGroups=[${rowGroups}] | pivots=[${pivots}] | values=[${values}]`
        );
    } catch (error) {
        console.warn('[CTP Deferred Example] logging failed', error);
    }
};

const onColumnMoved = () => logColumnStateSnapshot('columnMoved');
const onColumnVisible = () => logColumnStateSnapshot('columnVisible');
const onColumnRowGroupChanged = () => logColumnStateSnapshot('columnRowGroupChanged');
const onColumnPivotChanged = () => logColumnStateSnapshot('columnPivotChanged');
const onColumnValueChanged = () => logColumnStateSnapshot('columnValueChanged');
const onColumnPivotModeChanged = () => logColumnStateSnapshot('columnPivotModeChanged');

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    enableStrictPivotColumnOrder: true,
    rowModelType: 'serverSide',
    sideBar: {
        toolPanels: [
            {
                id: 'columns',
                labelDefault: 'Columns',
                labelKey: 'columns',
                iconKey: 'columns',
                toolPanel: 'agColumnsToolPanel',
                toolPanelParams: {
                    deferApply: true,
                    buttons: ['apply', 'cancel'],
                },
            },
        ],
        defaultToolPanel: 'columns',
    },
    onColumnMoved,
    onColumnVisible,
    onColumnRowGroupChanged,
    onColumnPivotChanged,
    onColumnValueChanged,
    onColumnPivotModeChanged,
};

document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => {
            const fakeServer = createFakeServer(data);
            const datasource = createServerSideDatasource(fakeServer);
            gridApi!.setGridOption('serverSideDatasource', datasource);
        });
});

function createServerSideDatasource(server: { getData: (request: IServerSideGetRowsRequest) => any }): IServerSideDatasource {
    return {
        getRows: (params) => {
            const requestId = ++requestSequence;
            console.log(`[CTP Deferred Example] Server request sent (#${requestId})`, params.request);
            const response = server.getData(params.request);

            setTimeout(() => {
                if (response.success) {
                    console.log(`[CTP Deferred Example] Server response received (#${requestId})`, {
                        startRow: params.request.startRow,
                        endRow: params.request.endRow,
                        returnedRows: response.rows.length,
                    });
                    params.success({ rowData: response.rows });
                } else {
                    console.log(`[CTP Deferred Example] Server request failed (#${requestId})`);
                    params.fail();
                }
            }, 200);
        },
    };
}

function createFakeServer(allData: IOlympicData[]) {
    return {
        getData: (request: IServerSideGetRowsRequest) => {
            const requestedRows = allData.slice(request.startRow, request.endRow);
            return {
                success: true,
                rows: requestedRows,
            };
        },
    };
}
