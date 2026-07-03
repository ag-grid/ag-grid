import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    RowGroupingModule,
    ShowValuesAsModule,
} from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextFilterModule,
    NumberFilterModule,
    ColumnMenuModule,
    ContextMenuModule,
    ColumnsToolPanelModule,
    RowGroupingModule,
    ShowValuesAsModule,
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', filter: 'agNumberColumnFilter' },
        // Each value as a share of its parent group.
        { field: 'gold', aggFunc: 'sum', showValuesAs: 'percentOfParentRowTotal' },
        { field: 'silver', aggFunc: 'sum', hide: true },
        // Each value as a share of the whole column.
        { field: 'total', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 160,
        enableValue: true,
        enableShowValuesAs: true,
        filter: true,
        floatingFilter: true,
    },
    autoGroupColumnDef: {
        minWidth: 220,
    },
    groupDefaultExpanded: 1,
    grandTotalRow: 'bottom',
    sideBar: {
        toolPanels: ['columns'],
        defaultToolPanel: undefined,
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
