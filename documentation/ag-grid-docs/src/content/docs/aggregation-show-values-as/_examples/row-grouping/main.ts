import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    RowGroupingModule,
    ShowValueAsModule,
} from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextFilterModule,
    NumberFilterModule,
    ColumnMenuModule,
    ContextMenuModule,
    ColumnsToolPanelModule,
    RowGroupingModule,
    ShowValueAsModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', filter: 'agNumberColumnFilter' },
        // Each value as a share of its parent group.
        { field: 'gold', aggFunc: 'sum', showValueAs: 'percentOfParentTotal' },
        { field: 'silver', aggFunc: 'sum' },
        // Each value as a share of the whole column.
        { field: 'total', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 130,
        enableValue: true,
        filter: true,
        floatingFilter: true,
    },
    autoGroupColumnDef: {
        minWidth: 220,
    },
    groupDefaultExpanded: 1,
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
