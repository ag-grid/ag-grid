import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ColumnMenuModule, ColumnsToolPanelModule, PivotModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    PivotModule,
    RowGroupingPanelModule,
    ColumnsToolPanelModule,
    ColumnMenuModule,
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'country', rowGroup: true, enableRowGroup: true, enablePivot: true },
        { field: 'sport', enableRowGroup: true, enablePivot: true },
        { field: 'year', pivot: true, enableRowGroup: true, enablePivot: true },
        { field: 'age', enableValue: true },
        { field: 'gold', aggFunc: 'sum', enableValue: true },
        { field: 'silver', enableValue: true },
        { field: 'bronze', enableValue: true },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 130,
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },
    pivotMode: true,
    sideBar: {
        toolPanels: ['columns'],
    },
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
