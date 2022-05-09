import { Grid, AreaSparklineOptions, ColumnFormatterParams, ColumnSparklineOptions, GridOptions, LineSparklineOptions, BarSparklineOptions, BarFormatterParams, MarkerFormatterParams } from '@ag-grid-community/core'
import { getData } from "./data";

const palette = {
  blue: 'rgb(20,94,140)',
  lightBlue: 'rgb(182,219,242)',
  green: 'rgb(63,141,119)',
  lightGreen: 'rgba(75,168,142, 0.2)',
};

const gridOptions: GridOptions = {
  rowHeight: 70,
  columnDefs: [
    {
      field: 'bar',
      headerName: 'Bar Sparkline',
      minWidth: 100,
      cellRenderer: 'agSparklineCellRenderer',
      cellRendererParams: {
        sparklineOptions: {
          type: 'bar',
          valueAxisDomain: [0, 100],
          label: {
            enabled: true,
            placement: 'outsideEnd',
            formatter: function (params) { return `${params.value}%` },
            fontWeight: 'bold',
            fontFamily: 'Arial, Helvetica, sans-serif',
          },
          highlightStyle: {
            strokeWidth: 0,
          },
          padding: {
            top: 15,
            bottom: 15,
          },
          formatter: barFormatter,
        } as BarSparklineOptions,
      },
    },
    {
      field: 'line',
      headerName: 'Line Sparkline',
      minWidth: 100,
      cellRenderer: 'agSparklineCellRenderer',
      cellRendererParams: {
        sparklineOptions: {
          line: {
            stroke: 'rgb(63,141,119)',
          },
          padding: {
            top: 10,
            bottom: 10,
          },
          marker: {
            formatter: lineMarkerFormatter,
          },
        } as LineSparklineOptions,
      },
    },
    {
      field: 'column',
      headerName: 'Column Sparkline',
      minWidth: 100,
      cellRenderer: 'agSparklineCellRenderer',
      cellRendererParams: {
        sparklineOptions: {
          type: 'column',
          label: {
            enabled: true,
            placement: 'outsideEnd',
            fontFamily: 'Arial, Helvetica, sans-serif',
          },
          highlightStyle: {
            strokeWidth: 0,
          },
          padding: {
            top: 15,
            bottom: 15,
          },
          formatter: columnFormatter,
        } as ColumnSparklineOptions,
      },
    },
    {
      field: 'area',
      headerName: 'Area Sparkline',
      minWidth: 100,
      cellRenderer: 'agSparklineCellRenderer',
      cellRendererParams: {
        sparklineOptions: {
          type: 'area',
          fill: 'rgba(75,168,142, 0.2)',
          line: {
            stroke: 'rgb(63,141,119)',
          },
          padding: {
            top: 10,
            bottom: 10,
          },
          marker: {
            formatter: areaMarkerFormatter,
          },
        } as AreaSparklineOptions,
      },
    },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    resizable: true,
  },
  rowData: getData(),
};

function barFormatter(params: BarFormatterParams) {
  const { yValue, highlighted } = params;

  if (highlighted) { return; }
  return { fill: yValue <= 50 ? palette.lightBlue : palette.blue };
}

function lineMarkerFormatter(params: MarkerFormatterParams) {
  const { first, last, highlighted } = params;

  const color = highlighted
    ? palette.blue
    : last
      ? palette.lightBlue
      : palette.green;

  return {
    size: highlighted || first || last ? 5 : 0,
    fill: color,
    stroke: color,
  };
}

function columnFormatter(params: ColumnFormatterParams) {
  const { yValue, highlighted } = params;

  if (highlighted) { return; }
  return { fill: yValue < 0 ? palette.lightBlue : palette.blue };
}

function areaMarkerFormatter(params: MarkerFormatterParams) {
  const { min, highlighted } = params;

  return {
    size: min || highlighted ? 5 : 0,
    fill: palette.green,
    stroke: palette.green,
  };
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
