import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import { ColumnMenuModule, ColumnsToolPanelModule, ContextMenuModule, PivotModule, RowGroupingPanelModule, ServerSideRowModelModule } from 'ag-grid-enterprise';



import { createFakeServer, createServerSideDatasource } from './fakeServer';





ModuleRegistry.registerModules([
    ColumnsToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    PivotModule,
    RowGroupingPanelModule,
    ServerSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const columnDefs: ColDef[] = [
    {
        field: 'athlete',
        minWidth: 200,
        enableRowGroup: true,
        enablePivot: true,
    },
    {
        field: 'age',
        enableValue: true,
    },
    {
        field: 'country',
        minWidth: 200,
        enableRowGroup: true,
        enablePivot: true,
        rowGroupIndex: 1,
    },
    {
        field: 'year',
        enableRowGroup: true,
        enablePivot: true,
        pivotIndex: 1,
    },
    {
        field: 'date',
        minWidth: 180,
        enableRowGroup: true,
        enablePivot: true,
    },
    {
        field: 'sport',
        minWidth: 200,
        enableRowGroup: true,
        enablePivot: true,
        rowGroupIndex: 2,
    },
    { field: 'gold', hide: true, enableValue: true },
    { field: 'silver', hide: true, enableValue: true, aggFunc: 'sum' },
    { field: 'bronze', hide: true, enableValue: true, aggFunc: 'sum' },
    { headerName: 'Total', field: 'total', enableValue: true },
];

let gridApi: GridApi<IOlympicData>;


function getDeferredDebugState() {
    return (gridApi.getToolPanelInstance('columns') as any).editStrategy.state;
}

function logToolPanelDebugState() {
    console.log('deferred state', getDeferredDebugState());
    console.log('grid state', gridApi.getState());
}

function installToolPanelDebugLogging() {
    const toolPanel = gridApi.getToolPanelInstance('columns') as any;
    const panelGui = toolPanel?.getGui?.() as HTMLElement | undefined;
    const editStrategy = toolPanel?.editStrategy as any;

    if (!panelGui || !editStrategy) {
        window.setTimeout(installToolPanelDebugLogging, 100);
        return;
    }

    if ((panelGui as any).__debugClickLoggingInstalled) {
        return;
    }

    (panelGui as any).__debugClickLoggingInstalled = true;

    const methodsThatChangeDeferredState = [
        'applyColumnState',
        'moveColumns',
        'setColumnsVisible',
        'setRowGroupColumns',
        'setValueColumns',
        'setColumnAggFunc',
        'setPivotColumns',
        'setPivotMode',
        'progressSortFromEvent',
        'reset',
    ] as const;

    for (const methodName of methodsThatChangeDeferredState) {
        const original = editStrategy[methodName];
        if (typeof original !== 'function') {
            continue;
        }

        editStrategy[methodName] = (...args: any[]) => {
            const result = original.apply(editStrategy, args);
            console.log('deferred state', getDeferredDebugState());
            return result;
        };
    }

    panelGui.addEventListener('click', (event) => {
        const button = (event.target as HTMLElement | null)?.closest('button');
        const label = button?.textContent?.trim();
        if (label !== 'Apply' && label !== 'Cancel') {
            return;
        }

        // Let the tool panel button handler update state before taking the snapshot.
        window.setTimeout(() => logToolPanelDebugState(), 0);
    });

    (window as any).gridApi = gridApi;
}

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
    },
    autoGroupColumnDef: {
        minWidth: 250,
    },
    pivotMode: true,
    rowModelType: 'serverSide',
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
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
                },
            },
        ],
        defaultToolPanel: 'columns',
    },
    getChildCount: (data: any) => (typeof data?.childCount === 'number' ? data.childCount : undefined),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
    installToolPanelDebugLogging();

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => {
            const fakeServer = createFakeServer(data);
            const datasource = createServerSideDatasource(fakeServer);
            gridApi!.setGridOption('serverSideDatasource', datasource);
        });
});
