import { GridOptions, LineSparklineOptions, TooltipRendererParams } from "@ag-grid-community/core";

const gridOptions: GridOptions = {
  columnDefs: [
      {field: 'symbol', maxWidth: 120},
      {field: 'name',  minWidth: 250 },
      {
          field: 'change',
          cellRenderer: 'agSparklineCellRenderer',
          cellRendererParams: {
              sparklineOptions: {
                  line: {
                      stroke: 'rgb(52, 168, 83)',
                      strokeWidth: 1
                  },
                  marker: {
                      stroke: 'rgb(52, 168, 83)',
                      fill: 'rgb(52, 168, 83)',
                      shape: 'circle',
                  },
                  highlightStyle: {
                      size: 4,
                      stroke: 'rgb(52, 168, 83)',
                      fill: 'rgb(52, 168, 83)',
                  },
                  tooltip: {
                      renderer: renderer
                  },
                  crosshairs: {
                      xLine: {
                          lineDash: 'dash',
                          stroke: 'rgba(52, 168, 83, 0.5)',
                          strokeWidth: 2,
                      },
                  }
              } as LineSparklineOptions
          }
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

function renderer(params: TooltipRendererParams) {
  return {
      backgroundColor: 'black',
      opacity: 0.5,
      color: 'white'
  }
}
// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
});
