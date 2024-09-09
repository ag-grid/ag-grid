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
        // different ways to define 'categories'
        { field: 'athlete', width: 150, chartDataType: 'category' },
        { field: 'age', chartDataType: 'category', sort: 'asc' },
        { field: 'sport' }, // inferred as category by grid

        // excludes year from charts
        { field: 'year', chartDataType: 'excluded' },

        // different ways to define 'series'
        { field: 'gold', chartDataType: 'series' },
        { field: 'silver', chartDataType: 'series' },
        { field: 'bronze' }, // inferred as series by grid
    ],
    defaultColDef: {
        flex: 1,
    },
    selection: { mode: 'cell' },
    popupParent: document.body,
    enableCharts: true,
    chartThemeOverrides: {
        common: {
            title: {
                enabled: true,
                text: 'Medals by Age',
            },
        },
        bar: {
            axes: {
                category: {
                    label: {
                        rotation: 0,
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
            rowEndIndex: 79,
            columns: ['age', 'gold', 'silver', 'bronze'],
        },
        chartType: 'groupedColumn',
        aggFunc: 'sum',
    });
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
