import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { ColumnMenuModule, ColumnsToolPanelModule, ContextMenuModule, ShowValueAsModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextFilterModule,
    NumberFilterModule,
    ColumnMenuModule,
    ContextMenuModule,
    ColumnsToolPanelModule,
    ShowValueAsModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', minWidth: 200 },
        { field: 'country' },
        { field: 'year', filter: 'agNumberColumnFilter' },
        // No row grouping: each row is shown as its share of the column's grand total.
        { field: 'gold', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' },
        // Compared to the previous row in display order — no aggregation denominator needed.
        { field: 'total', aggFunc: 'sum', showValueAs: { type: 'differenceFrom', params: { baseItem: '(previous)' } } },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 130,
        enableValue: true,
        filter: true,
        floatingFilter: true,
    },
    sideBar: 'columns',
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
