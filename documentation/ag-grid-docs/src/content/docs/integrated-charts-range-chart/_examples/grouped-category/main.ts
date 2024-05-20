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
        { field: 'division', width: 150, rowGroup: true, hide: true },
        { field: 'resource', width: 150, hide: true },
        { field: 'revenue' },
        { field: 'expenses' },
        { field: 'headcount' },
    ],
    defaultColDef: {
        flex: 1,
    },
    autoGroupColumnDef: {
        field: 'resource',
    },
    rowData: generateData(),
    enableRangeSelection: true,
    popupParent: document.body,
    enableCharts: true,
    groupDefaultExpanded: 1,
    chartThemeOverrides: {
        bar: {
            axes: {
                category: {
                    label: {
                        fontSize: 8,
                    },
                },
            },
        },
    },
    onFirstDataRendered: onFirstDataRendered,
};

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.createRangeChart({
        chartContainer: document.querySelector('#myChart') as HTMLElement,
        cellRange: {
            rowStartIndex: 0,
            rowEndIndex: 16,
            columns: ['expenses'],
        },
        chartType: 'groupedColumn',
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
