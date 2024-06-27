import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { FirstDataRenderedEvent, GridApi, GridOptions, ModuleRegistry, createGrid } from '@ag-grid-community/core';
import { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { generateData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule, MenuModule, RowGroupingModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'year', chartDataType: 'category' },
        { field: 'jan' },
        { field: 'feb' },
        { field: 'mar' },
        { field: 'apr' },
        { field: 'may' },
        { field: 'jun' },
        { field: 'jul' },
        { field: 'aug' },
        { field: 'sep' },
        { field: 'oct' },
        { field: 'nov' },
        { field: 'dec' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    rowData: generateData(),
    enableRangeSelection: true,
    popupParent: document.body,
    enableCharts: true,
    onFirstDataRendered: onFirstDataRendered,
};

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.createRangeChart({
        chartContainer: document.querySelector('#myChart') as HTMLElement,
        cellRange: {
            rowStartIndex: 0,
            rowEndIndex: 79,
            columns: ['year', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
        },
        chartType: 'line',
        aggFunc: 'sum',
        switchCategorySeries: true,
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
