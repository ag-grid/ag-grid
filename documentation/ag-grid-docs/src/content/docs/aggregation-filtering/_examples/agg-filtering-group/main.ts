import { ClientSideRowModelModule } from 'ag-grid-community';
import type { GridApi, GridOptions } from 'ag-grid-community';
import { createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { MenuModule } from 'ag-grid-enterprise';
import { RowGroupingModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ClientSideRowModelModule, MenuModule, RowGroupingModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year' },
        { field: 'total', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
    ],
    defaultColDef: {
        flex: 1,
        floatingFilter: true,
    },
    autoGroupColumnDef: {
        field: 'athlete',
    },
    groupDefaultExpanded: -1,
    groupAggFiltering: (params) => !!params.node.group,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
