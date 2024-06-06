import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { FirstDataRenderedEvent, GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule, MenuModule, RowGroupingModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'country', pivot: true },
        { field: 'year', rowGroup: true },
        { field: 'sport', rowGroup: true },
        { field: 'total', aggFunc: 'sum' },
        { field: 'gold', aggFunc: 'sum' },
    ],
    defaultColDef: {
        editable: true,
        flex: 1,
        minWidth: 150,
        filter: true,
    },
    autoGroupColumnDef: {
        minWidth: 150,
    },
    pivotMode: true,
    onFirstDataRendered,
    popupParent: document.body,
};

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.createPivotChart({
        chartType: 'groupedColumn',
        chartContainer: document.querySelector('#myChart') as HTMLElement,
        chartThemeOverrides: {
            common: {
                navigator: {
                    enabled: true,
                    height: 10,
                },
            },
        },
    });

    // expand one row for demonstration purposes
    setTimeout(() => params.api.getDisplayedRowAtIndex(2)!.setExpanded(true), 0);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/wide-spread-of-sports.json')
        .then((response) => response.json())
        .then(function (data) {
            gridApi!.setGridOption('rowData', data);
        });
});
