import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-quartz.css";
import {FirstDataRenderedEvent, GridOptions, ModuleRegistry, createGrid} from '@ag-grid-community/core';
import {ClientSideRowModelModule} from '@ag-grid-community/client-side-row-model';
import {GridChartsModule} from '@ag-grid-enterprise/charts-enterprise';
import {MenuModule} from '@ag-grid-enterprise/menu';
import {RowGroupingModule} from '@ag-grid-enterprise/row-grouping';

ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule, MenuModule, RowGroupingModule]);

class SimpleGrid {
    private gridOptions: GridOptions = <GridOptions>{};

    constructor() {
        this.gridOptions = {
            columnDefs: [
                // different ways to define 'categories'
                {field: 'athlete', width: 150, chartDataType: 'category'},
                {field: 'age', chartDataType: 'category', sort: 'asc'},
                {field: 'sport'}, // inferred as category by grid

                // excludes year from charts
                {field: 'year', chartDataType: 'excluded'},

                // different ways to define 'series'
                {field: 'gold', chartDataType: 'series'},
                {field: 'silver', chartDataType: 'series'},
                {field: 'bronze'}, // inferred as series by grid
            ],
            defaultColDef: {
                flex: 1
            },
            enableRangeSelection: true,
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
            onFirstDataRendered: (params: FirstDataRenderedEvent) => {
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
        }

        let eGridDiv: HTMLElement = <HTMLElement>document.querySelector('#myGrid');
        const gridApi = createGrid(eGridDiv, this.gridOptions);

        fetch('https://www.ag-grid.com/example-assets/wide-spread-of-sports.json')
            .then(response => response.json())
            .then(function (data) {
                gridApi!.setGridOption('rowData', data)
            })
    }
}

new SimpleGrid();
