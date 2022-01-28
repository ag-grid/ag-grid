import {
  Grid,
  GridOptions,
  LineSparklineOptions,
  TooltipRendererParams,
} from '@ag-grid-community/core'

const body = document.body;

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
    resizable: true,
  },
  rowData: getData(),
  rowHeight: 50,
}

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
  new Grid(gridDiv, gridOptions);
})
