import {
  ColDef,
  GridOptions,
  ICellRendererParams,
} from '@ag-grid-community/core'
declare var DaysFrostRenderer: any

interface ImageCellRendererParams extends ICellRendererParams {
  rendererImage: string
}

const columnDefs: ColDef[] = [
  {
    headerName: 'Month',
    field: 'Month',
    width: 75,
    cellStyle: { color: 'darkred' },
  },
  {
    headerName: 'Max Temp (˚C)',
    field: 'Max temp (C)',
    width: 120,
    cellRenderer: 'deltaIndicator', // Function cell renderer
  },
  {
    headerName: 'Min Temp (˚C)',
    field: 'Min temp (C)',
    width: 120,
    cellRenderer: 'deltaIndicator', // Function cell renderer
  },
  {
    headerName: 'Days of Air Frost',
    field: 'Days of air frost (days)',
    width: 233,
    cellRenderer: 'daysFrostRenderer', // Component Cell Renderer
    cellRendererParams: {
      rendererImage: 'frost.png', // Complementing the Cell Renderer parameters
    },
  },
  {
    headerName: 'Days Sunshine',
    field: 'Sunshine (hours)',
    width: 190,
    cellRenderer: 'daysSunshineRenderer',
    cellRendererParams: {
      rendererImage: 'sun.png', // Complementing the Cell Renderer parameters
    },
  },
  {
    headerName: 'Rainfall (10mm)',
    field: 'Rainfall (mm)',
    width: 180,
    cellRenderer: 'rainPerTenMmRenderer',
    cellRendererParams: {
      rendererImage: 'rain.png', // Complementing the Cell Renderer parameters
    },
  },
]

/**
 * Demonstrating function cell renderer
 * Visually indicates if this months value is higher or lower than last months value
 * by adding an +/- symbols according to the difference
 */
const deltaIndicator = (params: ICellRendererParams) => {
  const element = document.createElement('span')
  const imageElement = document.createElement('img')

  // visually indicate if this months value is higher or lower than last months value
  if (params.value > 15) {
    imageElement.src =
      'https://www.ag-grid.com/example-assets/weather/fire-plus.png'
  } else {
    imageElement.src =
      'https://www.ag-grid.com/example-assets/weather/fire-minus.png'
  }
  element.appendChild(imageElement)
  element.appendChild(document.createTextNode(params.value))
  return element
}

/**
 *  Cell Renderer by Property (using the api)
 */
const daysSunshineRenderer = (params: ImageCellRendererParams) => {
  const daysSunshine = params.value / 24
  return createImageSpan(daysSunshine, params.rendererImage)
}

/**
 *  Cell Renderer by Property (using the grid options parameter)
 */
const rainPerTenMmRenderer = (params: ImageCellRendererParams) => {
  const rainPerTenMm = params.value / 10
  return createImageSpan(rainPerTenMm, params.rendererImage)
}

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  rowData: null,
  components: {
    deltaIndicator: deltaIndicator,
    daysFrostRenderer: DaysFrostRenderer,
    daysSunshineRenderer: daysSunshineRenderer,
    rainPerTenMmRenderer: rainPerTenMmRenderer,
  },
  defaultColDef: {
    editable: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  },
}

const createImageSpan = (imageMultiplier: number, image: string) => {
  const resultElement = document.createElement('span')
  for (let i = 0; i < imageMultiplier; i++) {
    const imageElement = document.createElement('img')
    imageElement.src = 'https://www.ag-grid.com/example-assets/weather/' + image
    resultElement.appendChild(imageElement)
  }
  return resultElement
}

/**
 * Updates the Days of Air Frost column - adjusts the value which in turn will demonstrate the Component refresh functionality
 * After a data update, cellRenderer Components.refresh method will be called to re-render the altered Cells
 */
const frostierYear = (extraDaysFrost: number) => {
  // iterate over the rows and make each "days of air frost"
  gridOptions.api!.forEachNode(rowNode => {
    rowNode.setDataValue(
      'Days of air frost (days)',
      rowNode.data['Days of air frost (days)'] + extraDaysFrost
    )
  })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector('#myGrid')
  new agGrid.Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/weather-se-england.json')
    .then(response => response.json())
    .then(data => {
      gridOptions.api!.setRowData(data)
    })
})
