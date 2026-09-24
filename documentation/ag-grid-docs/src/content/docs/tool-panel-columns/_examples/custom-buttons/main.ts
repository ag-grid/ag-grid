import type { ColDef, ColumnToolPanelButtonActionParams, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    GridStateModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnMenuModule, ColumnsToolPanelModule, ContextMenuModule, RowGroupingModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnApiModule,
    GridStateModule,
    ColumnsToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    RowGroupingModule,
]);

const columnDefs: ColDef[] = [
    { field: 'athlete', minWidth: 200 },
    { field: 'age', enableValue: true },
    { field: 'country', minWidth: 200, enableRowGroup: true },
    { field: 'year', enableRowGroup: true },
    { field: 'sport', minWidth: 200, enableRowGroup: true },
    { field: 'gold', hide: true, enableValue: true },
    { field: 'silver', hide: true, enableValue: true },
    { field: 'bronze', hide: true, enableValue: true },
    { headerName: 'Total', field: 'total', enableValue: true },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
    },
    autoGroupColumnDef: {
        minWidth: 250,
    },
    // Start from a layout that differs from the column definitions, so Reset has something to undo
    initialState: {
        columnVisibility: {
            hiddenColIds: ['age', 'year'],
        },
        columnOrder: {
            orderedColIds: ['athlete', 'age', 'country', 'year', 'sport', 'total', 'gold', 'silver', 'bronze'],
        },
    },
    sideBar: {
        toolPanels: [
            {
                id: 'columns',
                labelDefault: 'Columns',
                labelKey: 'columns',
                iconKey: 'columns',
                toolPanel: 'agColumnsToolPanel',
                toolPanelParams: {
                    buttons: [
                        {
                            label: 'Sports Stats',
                            action: (params: ColumnToolPanelButtonActionParams<IOlympicData>) =>
                                params.api.applyColumnState({
                                    state: [
                                        { colId: 'sport', rowGroup: true, hide: true },
                                        { colId: 'gold', hide: false, aggFunc: 'sum' },
                                        { colId: 'silver', hide: false, aggFunc: 'sum' },
                                        { colId: 'bronze', hide: false, aggFunc: 'sum' },
                                    ],
                                    // Hide and ungroup every column not listed above
                                    defaultState: { hide: true, rowGroup: false, aggFunc: null },
                                }),
                        },
                        {
                            label: 'Reset',
                            action: (params: ColumnToolPanelButtonActionParams<IOlympicData>) =>
                                params.api.resetColumnState(),
                        },
                    ],
                },
            },
        ],
        defaultToolPanel: 'columns',
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
