import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    PivotModule,
    ShowValuesAsModule,
} from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnMenuModule,
    ContextMenuModule,
    ColumnsToolPanelModule,
    PivotModule,
    ShowValuesAsModule,
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'country', rowGroup: true },
        { field: 'year', pivot: true },
        // In pivot mode each pivot column is shown as a share of that column's total (each column = 100%).
        { field: 'gold', aggFunc: 'sum', showValuesAs: 'percentOfColumnTotal' },
        { field: 'silver', aggFunc: 'sum' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 160,
        enableValue: true,
        enableShowValuesAs: true,
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },
    pivotMode: true,
    sideBar: {
        toolPanels: ['columns'],
        defaultToolPanel: undefined,
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
