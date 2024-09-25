import { ClientSideRowModelModule } from 'ag-grid-community';
import { GridApi, GridOptions, LineSparklineOptions, TooltipRendererParams, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { SparklinesModule } from 'ag-grid-enterprise';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule, SparklinesModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'symbol', maxWidth: 120 },
        { field: 'name', minWidth: 250 },
        {
            field: 'change',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    line: {
                        stroke: 'rgb(52, 168, 83)',
                    },
                    highlightStyle: {
                        size: 4,
                        stroke: 'rgb(52, 168, 83)',
                        fill: 'rgb(52, 168, 83)',
                    },
                    tooltip: {
                        renderer: renderer,
                    },
                    crosshairs: {
                        xLine: {
                            enabled: true,
                            lineDash: 'dash',
                            stroke: '#999',
                        },
                        yLine: {
                            enabled: true,
                            lineDash: 'dash',
                            stroke: '#999',
                        },
                    },
                } as LineSparklineOptions,
            },
        },
        {
            field: 'rateOfChange',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    line: {
                        stroke: 'rgb(168,52,137)',
                    },
                    highlightStyle: {
                        size: 4,
                        stroke: 'rgb(168,52,137)',
                        fill: 'rgb(168,52,137)',
                    },
                    tooltip: {
                        renderer: renderer,
                    },
                    crosshairs: {
                        xLine: {
                            enabled: false,
                        },
                    },
                } as LineSparklineOptions,
            },
        },
        {
            field: 'volume',
            type: 'numericColumn',
            maxWidth: 140,
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    rowData: getData(),
    rowHeight: 50,
};

function renderer(params: TooltipRendererParams) {
    return {
        backgroundColor: 'black',
        opacity: 0.9,
        color: 'white',
    };
}
// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
