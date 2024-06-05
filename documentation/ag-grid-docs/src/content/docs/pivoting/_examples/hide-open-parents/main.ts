import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

ModuleRegistry.registerModules([
    CommunityFeaturesModule,
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    MenuModule,
    RowGroupingModule,
]);

const columnDefs: ColDef[] = [
    // row group columns
    { field: 'country', rowGroup: true },
    { field: 'athlete', rowGroup: true },

    // pivot column
    {
        headerName: 'Year',
        // to mix it up a bit, here we are using a valueGetter for the year column.
        valueGetter: 'data.year',
        pivot: true,
    },

    // aggregation columns
    { field: 'gold', aggFunc: 'sum' },
    { field: 'silver', aggFunc: 'sum' },
    { field: 'bronze', aggFunc: 'sum' },
    { field: 'total', aggFunc: 'sum' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
        filter: true,
    },
    autoGroupColumnDef: {
        minWidth: 250,
    },
    pivotMode: true,
    groupDefaultExpanded: 9,
    groupHideOpenParents: true,
    groupDisplayType: 'multipleColumns',
    sideBar: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then(function (data) {
            gridApi!.setGridOption('rowData', data);
        });
});
