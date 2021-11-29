import { LineSparklineOptions, TooltipRendererParams } from '@ag-grid-community/core'

var gridOptions = {
  columnDefs: [
    { field: 'symbol', maxWidth: 120 },
    { field: 'name', minWidth: 250 },
    {
      field: 'change',
      cellRenderer: 'agSparklineCellRenderer',
      cellRendererParams: {
        sparklineOptions: {
          line: {
            stroke: 'rgb(0, 113, 235)',
          },
          tooltip: {
            renderer: tooltipRenderer,
          },
          highlightStyle: {
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
};

function tooltipRenderer(params: TooltipRendererParams) {
  const { yValue, context } = params;
  return `<div class='my-custom-tooltip'>
            <span class='tooltip-title'>${context.data.symbol}</span>
            <span class='tooltip-content'>${yValue}</span>
          </div>`;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
});
