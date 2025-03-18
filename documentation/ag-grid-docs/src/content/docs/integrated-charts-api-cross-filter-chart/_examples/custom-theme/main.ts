import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';

import type {
    FirstDataRenderedEvent,
    GridApi,
    GridOptions,
    GridReadyEvent,
    ValueFormatterParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateEditorModule,
    ModuleRegistry,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    FiltersToolPanelModule,
    IntegratedChartsModule,
    MultiFilterModule,
    RowGroupingModule,
    SetFilterModule,
} from 'ag-grid-enterprise';

import { getData, phones } from './data';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    IntegratedChartsModule.with(AgChartsEnterpriseModule),
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    MultiFilterModule,
    SetFilterModule,
    RowGroupingModule,
    NumberFilterModule,
    TextFilterModule,
    TextEditorModule,
    DateEditorModule,
    NumberEditorModule,
    ValidationModule /* Development Only */,
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'salesRep', chartDataType: 'category' },
        { field: 'handset', chartDataType: 'category' },
        { field: 'handsetIndex', chartDataType: 'series', hide: true },
        { field: 'quarterIndex', chartDataType: 'series', hide: true },
        {
            headerName: 'Sale Price',
            field: 'sale',
            maxWidth: 160,
            aggFunc: 'sum',
            filter: 'agNumberColumnFilter',
            chartDataType: 'series',
        },
        {
            field: 'saleDate',
            chartDataType: 'category',
            filter: 'agSetColumnFilter',
            filterParams: {
                valueFormatter: (params: ValueFormatterParams) => `${params.value}`,
            },
            sort: 'asc',
        },
        {
            field: 'quarter',
            maxWidth: 160,
            filter: 'agSetColumnFilter',
            chartDataType: 'category',
        },
    ],
    defaultColDef: {
        flex: 1,
        editable: true,
        filter: 'agMultiColumnFilter',
        floatingFilter: true,
    },
    enableCharts: true,
    customChartThemes: {
        'my-custom-theme-light': {
            palette: {
                fills: ['purple', 'indigo', 'blue', 'green', 'yellow', 'orange', 'red'],
            },
        },
        'my-custom-theme-dark': {
            palette: {
                fills: ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'purple'],
                strokes: ['white'],
            },
            overrides: {
                common: {
                    title: {
                        color: 'white',
                    },
                    axes: {
                        category: {
                            label: {
                                color: 'white',
                            },
                        },
                        number: {
                            label: {
                                color: 'white',
                            },
                        },
                    },
                    legend: {
                        item: {
                            label: {
                                color: 'white',
                            },
                        },
                    },
                },
            },
        },
    },
    chartThemes: ['my-custom-theme-light', 'my-custom-theme-dark'],
    chartThemeOverrides: {
        common: {
            background: {
                fill: 'transparent',
            },
            zoom: {
                enabled: false,
            },
            axes: {
                number: {
                    crosshair: {
                        enabled: false,
                    },
                },
                category: {
                    crosshair: {
                        enabled: false,
                    },
                },
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
    onGridReady: (params: GridReadyEvent) => {
        getData().then((rowData) => params.api.setGridOption('rowData', rowData));
    },
    onFirstDataRendered,
};

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    createQuarterlySalesChart(params.api);
    createSalesByRefChart(params.api);
    createHandsetSalesChart(params.api);
    createBubbleChart(params.api);
}

function createQuarterlySalesChart(api: GridApi) {
    api.createCrossFilterChart({
        chartType: 'column',
        cellRange: {
            columns: ['quarter', 'sale'],
        },
        aggFunc: 'sum',
        chartThemeOverrides: {
            common: {
                title: {
                    enabled: true,
                    text: 'Quarterly Sales ($)',
                },
                legend: { enabled: false },
                axes: {
                    category: {
                        label: {
                            rotation: 0,
                        },
                    },
                    number: {
                        label: {
                            formatter: (params: any) => {
                                return params.value / 1000 + 'k';
                            },
                        },
                    },
                },
            },
        },
        chartContainer: document.querySelector('#columnChart') as any,
    });
}

function createSalesByRefChart(api: GridApi) {
    api.createCrossFilterChart({
        chartType: 'pie',
        cellRange: {
            columns: ['salesRep', 'sale'],
        },
        aggFunc: 'sum',
        chartThemeOverrides: {
            common: {
                title: {
                    enabled: true,
                    text: 'Sales by Representative ($)',
                },
            },
            pie: {
                series: {
                    title: {
                        enabled: false,
                    },
                    calloutLabel: {
                        enabled: false,
                    },
                },
                legend: {
                    position: 'right',
                },
            },
        },
        chartContainer: document.querySelector('#pieChart') as any,
    });
}

function createHandsetSalesChart(api: GridApi) {
    api.createCrossFilterChart({
        chartType: 'area',
        cellRange: {
            columns: ['handset', 'sale'],
        },
        aggFunc: 'count',
        chartThemeOverrides: {
            common: {
                title: {
                    enabled: true,
                    text: 'Handsets Sold (Units)',
                },
                padding: { left: 47, right: 80 },
            },
        },
        chartContainer: document.querySelector('#areaChart') as any,
    });
}

function createBubbleChart(api: GridApi) {
    api.createCrossFilterChart({
        chartType: 'bubble',
        cellRange: {
            columns: ['quarterIndex', 'handsetIndex', 'sale'],
        },
        aggFunc: 'sum',
        chartThemeOverrides: {
            common: {
                title: {
                    enabled: true,
                    text: 'Sales by Quarter and Handset',
                },
                legend: {
                    enabled: false,
                },
                seriesArea: {
                    padding: {
                        left: 8,
                        bottom: 8,
                    },
                },
                axes: {
                    number: {
                        label: {
                            formatter: (params: any) => {
                                // For this example only: format two number series differently with a single formatter
                                if (params.value < 10) {
                                    if (Math.floor(params.value) !== params.value) {
                                        return '';
                                    }
                                    return `Q${params.value}`;
                                } else {
                                    return phones[params.value - 10]?.handset ?? '';
                                }
                            },
                        },
                        nice: false,
                    },
                },
            },
        },
        chartContainer: document.querySelector('#bubbleChart') as any,
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
