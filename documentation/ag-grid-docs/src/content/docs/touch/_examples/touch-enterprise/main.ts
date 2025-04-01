import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import { ColumnsToolPanelModule, PivotModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    PivotModule,
    RowGroupingPanelModule,
    ColumnsToolPanelModule,
    ValidationModule /* Development Only */,
]);

const columnDefs: ColDef[] = [
    { field: 'country', rowGroup: true },
    { field: 'sport', pivot: true },
    { field: 'year', pivot: true },
    { field: 'gold', aggFunc: 'sum' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    defaultColDef: {
        minWidth: 100,
        enableValue: true,
        enableRowGroup: true,
        enablePivot: true,
    },
    sideBar: 'columns',
    allowDragFromColumnsToolPanel: true,
    pivotMode: true,
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
