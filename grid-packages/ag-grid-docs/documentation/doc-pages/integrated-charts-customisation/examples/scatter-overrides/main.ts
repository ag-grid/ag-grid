import {createGrid, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent} from '@ag-grid-community/core';
import {getData} from "./data";

let gridApi: GridApi;

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', width: 150, chartDataType: 'category' },
    { field: 'total', chartDataType: 'series' },
    { field: 'gold', chartDataType: 'series' },
    { field: 'silver', chartDataType: 'series' },
    { field: 'bronze', chartDataType: 'series' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
  },
  popupParent: document.body,
  enableRangeSelection: true,
  enableCharts: true,
  chartThemeOverrides: {
    scatter: {
      series: {
        highlightStyle: {
          item: {
            fill: 'red',
            stroke: 'yellow',
          },
        },
        marker: {
          enabled: true,
          shape: 'square',
          size: 5,
          // @ts-ignore charts typing
          maxSize: 12,
          strokeWidth: 4,
          fillOpacity: 0.7,
          strokeOpacity: 0.6,
        },
        tooltip: {
          // @ts-ignore charts typing applied any to avoid issues
          renderer: (params: any) => {
            var label = params.datum[params.labelKey!]
            // @ts-ignore charts typing
            var size = params.datum[params.sizeKey!]

            return {
              content:
                (label != null
                  ? '<b>' +
                  params.labelName!.toUpperCase() +
                  ':</b> ' +
                  label +
                  '<br/>'
                  : '') +
                '<b>' +
                params.xName!.toUpperCase() +
                ':</b> ' +
                  // @ts-ignore charts typing
                params.xValue +
                '<br/>' +
                '<b>' +
                params.yName!.toUpperCase() +
                ':</b> ' +
                  // @ts-ignore charts typing
                params.yValue +
                (size != null
                    // @ts-ignore charts typing
                  ? '<br/><b>' + params.sizeName!.toUpperCase() + ':</b> ' + size
                  : ''),
            }
          },
        },
      },
    },
  },
  onGridReady : (params: GridReadyEvent) => {
    getData().then(rowData => params.api.setGridOption('rowData', rowData));
  },
  onFirstDataRendered,
};



function onFirstDataRendered(params: FirstDataRenderedEvent) {
  params.api.createRangeChart({
    cellRange: {
      rowStartIndex: 0,
      rowEndIndex: 4,
      columns: ['country', 'total', 'gold', 'silver', 'bronze'],
    },
    chartType: 'scatter',
  });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})
