import { ClientSideRowModelModule } from 'ag-grid-community';
import { GridApi, GridOptions, LineSparklineOptions, TooltipRendererParams, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { SparklinesModule } from 'ag-grid-enterprise';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule, SparklinesModule]);

const body = document.body;

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
                    tooltip: {
                        container: body, // confines the tooltip to the document body node instead of the sparkline cell
                        xOffset: 0, // positions tooltip 0 pixels to the right of the mouse cursor
                        yOffset: 20, // positions tooltip 20 pixels down from the mouse cursor
                        renderer: tooltipRenderer,
                    },
                    highlightStyle: {
                        size: 5,
                        fill: 'rgb(0, 113, 235)',
                        strokeWidth: 0,
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

function tooltipRenderer(params: TooltipRendererParams) {
    const { yValue, context } = params;
    return `<div class='sparkline-tooltip'>
            <div class='tooltip-title'>${context.data.symbol}</div>
            <div class='tooltip-content'>${yValue}</div>
         </div>`;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
