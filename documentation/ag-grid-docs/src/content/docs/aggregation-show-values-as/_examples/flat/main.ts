import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule, RowGroupingModule, ShowValuesAsModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextFilterModule,
    NumberFilterModule,
    RowGroupingModule,
    ColumnMenuModule,
    ContextMenuModule,
    ShowValuesAsModule,
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', minWidth: 200 },
        { field: 'country' },
        { field: 'year', filter: 'agNumberColumnFilter' },
        // No row grouping: each row is shown as its share of the column's grand total.
        { field: 'gold', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 130,
        enableValue: true,
        enableShowValuesAs: true,
        filter: true,
        floatingFilter: true,
    },
    grandTotalRow: 'bottom',
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
