import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    PivotModule,
    RowGroupingPanelModule,
} from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    PivotModule,
    RowGroupingPanelModule,
]);

const columnDefs: ColDef[] = [
    { field: 'athlete', minWidth: 200, enableRowGroup: true, enablePivot: true },
    { field: 'age', enableValue: true },
    { field: 'country', minWidth: 200, enableRowGroup: true, enablePivot: true, rowGroup: true },
    { field: 'year', enableRowGroup: true, enablePivot: true },
    { field: 'date', minWidth: 180, enableRowGroup: true, enablePivot: true },
    { field: 'sport', minWidth: 200, enableRowGroup: true, enablePivot: true },
    { field: 'gold', hide: true, enableValue: true },
    { field: 'silver', hide: true, enableValue: true, aggFunc: 'sum' },
    { field: 'bronze', hide: true, enableValue: true, aggFunc: 'sum' },
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
                    buttons: ['cancel', 'apply'],
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
