import { Grid, ChartMenuOptions, CreateRangeChartParams, FirstDataRenderedEvent, GridOptions } from '@ag-grid-community/core'
declare var moment: any;

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'timestamp', chartDataType: 'time' },
    { field: 'cpuUsage' },
  ],
  defaultColDef: {
    flex: 1,
    resizable: true,
  },
  popupParent: document.body,
  rowData: getRowData(),
  enableRangeSelection: true,
  enableCharts: true,
  chartThemeOverrides: {
    area: {
      title: {
        enabled: true,
        text: 'CPU Usage',
      },
      legend: {
        enabled: false,
      },
      navigator: {
        enabled: true,
        height: 20,
        margin: 25,
      },
      axes: {
        time: {
          label: {
            rotation: 315,
            format: '%H:%M',
          },
        },
        number: {
          label: {
            formatter: (params) => {
              return params.value + '%'
            },
          },
        },
      },
      series: {
        tooltip: {
          renderer: ({ xValue, yValue }) => {
            xValue = xValue instanceof Date ? xValue : new Date(xValue);
            return {
              content: `${moment(xValue).format('HH:mm:ss')}: ${yValue}%`,
            };
          },
        },
      },
    },
  },
  chartToolPanelsDef: {
    panels: ['data', 'format']
  },
  onFirstDataRendered: onFirstDataRendered,
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  const createRangeChartParams: CreateRangeChartParams = {
    chartContainer: document.querySelector('#myChart') as HTMLElement,
    suppressChartRanges: true,
    cellRange: {
      columns: ['timestamp', 'cpuUsage'],
    },
    chartType: 'area',
  }

  params.api.createRangeChart(createRangeChartParams)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  let gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})

function getRowData() {
  return [
    { timestamp: 1600983900792, cpuUsage: 99 },
    { timestamp: 1600983905792, cpuUsage: 83 },
    { timestamp: 1600983912792, cpuUsage: 59 },
    { timestamp: 1600983915792, cpuUsage: 70 },
    { timestamp: 1600983921792, cpuUsage: 99 },
    { timestamp: 1600983929792, cpuUsage: 74 },
    { timestamp: 1600983930792, cpuUsage: 90 },
    { timestamp: 1600983936792, cpuUsage: 96 },
    { timestamp: 1600983942792, cpuUsage: 39 },
    { timestamp: 1600983950792, cpuUsage: 39 },
    { timestamp: 1600983955792, cpuUsage: 65 },
    { timestamp: 1600983960792, cpuUsage: 100 },
    { timestamp: 1600983965792, cpuUsage: 99 },
    { timestamp: 1600983972792, cpuUsage: 39 },
    { timestamp: 1600983974792, cpuUsage: 83 },
    { timestamp: 1600983979792, cpuUsage: 42 },
    { timestamp: 1600983982792, cpuUsage: 68 },
    { timestamp: 1600983985792, cpuUsage: 81 },
    { timestamp: 1600983992792, cpuUsage: 99 },
    { timestamp: 1600983999792, cpuUsage: 81 },
    { timestamp: 1600984004792, cpuUsage: 81 },
    { timestamp: 1600984006792, cpuUsage: 57 },
    { timestamp: 1600984009792, cpuUsage: 67 },
    { timestamp: 1600984014792, cpuUsage: 49 },
    { timestamp: 1600984017792, cpuUsage: 81 },
    { timestamp: 1600984025792, cpuUsage: 42 },
    { timestamp: 1600984029792, cpuUsage: 77 },
    { timestamp: 1600984031792, cpuUsage: 58 },
    { timestamp: 1600984036792, cpuUsage: 30 },
    { timestamp: 1600984039792, cpuUsage: 52 },
    { timestamp: 1600984043792, cpuUsage: 61 },
    { timestamp: 1600984044792, cpuUsage: 45 },
    { timestamp: 1600984048792, cpuUsage: 47 },
    { timestamp: 1600984049792, cpuUsage: 66 },
    { timestamp: 1600984050792, cpuUsage: 46 },
    { timestamp: 1600984053792, cpuUsage: 36 },
    { timestamp: 1600984061792, cpuUsage: 77 },
    { timestamp: 1600984062792, cpuUsage: 39 },
    { timestamp: 1600984068792, cpuUsage: 39 },
    { timestamp: 1600984076792, cpuUsage: 49 },
    { timestamp: 1600984084792, cpuUsage: 96 },
    { timestamp: 1600984086792, cpuUsage: 31 },
    { timestamp: 1600984092792, cpuUsage: 67 },
    { timestamp: 1600984098792, cpuUsage: 32 },
    { timestamp: 1600984104792, cpuUsage: 92 },
    { timestamp: 1600984110792, cpuUsage: 81 },
    { timestamp: 1600984115792, cpuUsage: 90 },
    { timestamp: 1600984117792, cpuUsage: 47 },
    { timestamp: 1600984123792, cpuUsage: 97 },
    { timestamp: 1600984128792, cpuUsage: 72 },
    { timestamp: 1600984131792, cpuUsage: 98 },
    { timestamp: 1600984137792, cpuUsage: 74 },
    { timestamp: 1600984145792, cpuUsage: 34 },
    { timestamp: 1600984151792, cpuUsage: 78 },
    { timestamp: 1600984152792, cpuUsage: 50 },
    { timestamp: 1600984160792, cpuUsage: 77 },
    { timestamp: 1600984165792, cpuUsage: 99 },
    { timestamp: 1600984171792, cpuUsage: 89 },
    { timestamp: 1600984175792, cpuUsage: 61 },
    { timestamp: 1600984182792, cpuUsage: 53 },
    { timestamp: 1600984187792, cpuUsage: 56 },
    { timestamp: 1600984193792, cpuUsage: 73 },
    { timestamp: 1600984198792, cpuUsage: 69 },
    { timestamp: 1600984205792, cpuUsage: 33 },
    { timestamp: 1600984213792, cpuUsage: 65 },
    { timestamp: 1600984219792, cpuUsage: 60 },
    { timestamp: 1600984226792, cpuUsage: 95 },
    { timestamp: 1600984232792, cpuUsage: 86 },
    { timestamp: 1600984236792, cpuUsage: 38 },
    { timestamp: 1600984238792, cpuUsage: 67 },
    { timestamp: 1600984243792, cpuUsage: 83 },
    { timestamp: 1600984250792, cpuUsage: 99 },
    { timestamp: 1600984253792, cpuUsage: 41 },
    { timestamp: 1600984260792, cpuUsage: 32 },
    { timestamp: 1600984263792, cpuUsage: 61 },
    { timestamp: 1600984267792, cpuUsage: 34 },
    { timestamp: 1600984271792, cpuUsage: 80 },
    { timestamp: 1600984276792, cpuUsage: 94 },
    { timestamp: 1600984277792, cpuUsage: 34 },
    { timestamp: 1600984278792, cpuUsage: 80 },
    { timestamp: 1600984282792, cpuUsage: 84 },
    { timestamp: 1600984287792, cpuUsage: 31 },
    { timestamp: 1600984291792, cpuUsage: 71 },
    { timestamp: 1600984297792, cpuUsage: 74 },
    { timestamp: 1600984299792, cpuUsage: 99 },
    { timestamp: 1600984302792, cpuUsage: 82 },
    { timestamp: 1600984303792, cpuUsage: 36 },
    { timestamp: 1600984311792, cpuUsage: 97 },
    { timestamp: 1600984319792, cpuUsage: 97 },
    { timestamp: 1600984327792, cpuUsage: 62 },
    { timestamp: 1600984330792, cpuUsage: 97 },
    { timestamp: 1600984333792, cpuUsage: 34 },
    { timestamp: 1600984338792, cpuUsage: 67 },
    { timestamp: 1600984342792, cpuUsage: 99 },
    { timestamp: 1600984343792, cpuUsage: 77 },
    { timestamp: 1600984349792, cpuUsage: 51 },
    { timestamp: 1600984353792, cpuUsage: 75 },
    { timestamp: 1600984356792, cpuUsage: 41 },
    { timestamp: 1600984360792, cpuUsage: 81 },
    { timestamp: 1600984380792, cpuUsage: 61 },
    { timestamp: 1600984400792, cpuUsage: 71 },
    { timestamp: 1600984410792, cpuUsage: 77 },
    { timestamp: 1600984420792, cpuUsage: 62 },
    { timestamp: 1600984429792, cpuUsage: 55 },
    { timestamp: 1600984430792, cpuUsage: 45 },
    { timestamp: 1600984432792, cpuUsage: 50 },
    { timestamp: 1600984436792, cpuUsage: 60 },
    { timestamp: 1600984439792, cpuUsage: 69 },
  ]
}
