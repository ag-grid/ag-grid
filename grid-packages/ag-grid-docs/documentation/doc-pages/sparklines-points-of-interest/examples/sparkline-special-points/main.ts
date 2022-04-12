import { Grid, AreaSparklineOptions, ColumnFormatterParams, ColumnSparklineOptions, GridOptions, LineSparklineOptions, BarSparklineOptions, BarFormatterParams, MarkerFormatterParams } from '@ag-grid-community/core'

const palette = {
  blue: 'rgba(3,195,168,0.9)',
  red: 'rgb(228,21,81)',
  yellow: 'rgba(251,203,110,0.9)',
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
            formatter: function(params) { return  `${params.value}%`},
            fontWeight: 'bold',
            fontSize: 12,
            fontFamily: 'Arial, Helvetica, sans-serif',
            color: 'white',
          },
          highlightStyle: {
            strokeWidth: 0,
          },
          padding: {
            top: 10,
            bottom: 10,
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
            stroke: 'rgb(251,203,110)',
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
            fontSize: 9,
            fontFamily: 'Arial, Helvetica, sans-serif',
            color: 'white',
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
          fill: 'rgba(251,203,110, 0.2)',
          line: {
            stroke: 'rgb(251,203,110)',
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

  if (!highlighted) {
    if (yValue <= 50) {
      return { fill: palette.red };
    }
    if (yValue < 50) {
      return { fill: palette.yellow };
    }
    return { fill: palette.blue };
  }
}

function lineMarkerFormatter(params: MarkerFormatterParams) {
  const { first, last, highlighted } = params;

  const color = highlighted
    ? palette.blue
    : last
      ? palette.red
      : palette.yellow;

  return {
    size: highlighted || first || last ? 5 : 0,
    fill: color,
    stroke: color,
  };
}

function columnFormatter(params: ColumnFormatterParams) {
  const { yValue, highlighted } = params;

  if (!highlighted) {
    if (yValue < 0) {
      return { fill: palette.red };
    }
    return { fill: palette.blue };
  }
}

function areaMarkerFormatter(params: MarkerFormatterParams) {
  const { min } = params;

  return {
    size: min ? 5 : 0,
    fill: palette.red,
    stroke: palette.red,
  };
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
