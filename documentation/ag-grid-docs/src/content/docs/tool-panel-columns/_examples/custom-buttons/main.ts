import type {
    ColDef,
    ColumnState,
    ColumnToolPanelButtonActionParams,
    GridApi,
    GridOptions,
    GridReadyEvent,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
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
let savedColumnState: ColumnState[] = [];

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
    },
    autoGroupColumnDef: {
        minWidth: 250,
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
                            label: 'Medals by Country',
                            action: (params: ColumnToolPanelButtonActionParams<IOlympicData>) =>
                                params.updatePanelColumns({
                                    state: [
                                        { colId: 'country', rowGroup: true, hide: true },
                                        { colId: 'athlete', hide: true },
                                        { colId: 'age', hide: true },
                                        { colId: 'year', hide: true },
                                        { colId: 'gold', hide: false, aggFunc: 'sum' },
                                        { colId: 'silver', hide: false, aggFunc: 'sum' },
                                        { colId: 'bronze', hide: false, aggFunc: 'sum' },
                                        { colId: 'total', aggFunc: 'sum', sort: 'desc' },
                                    ],
                                }),
                        },
                        {
                            label: 'Reset',
                            action: (params: ColumnToolPanelButtonActionParams<IOlympicData>) =>
                                params.updatePanelColumns({ state: savedColumnState, applyOrder: true }),
                        },
                        'cancel',
                        'apply',
                    ],
                },
            },
        ],
        defaultToolPanel: 'columns',
    },
    onGridReady: (params: GridReadyEvent<IOlympicData>) => {
        savedColumnState = params.api.getColumnState();
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
