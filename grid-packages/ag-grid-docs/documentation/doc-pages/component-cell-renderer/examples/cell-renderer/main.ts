import {
  ColDef, Grid,
  GridOptions,
  ICellRendererParams,
} from '@ag-grid-community/core'
import { DaysFrostRenderer, ImageCellRendererParams } from './daysFrostRenderer_typescript';

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
function daysSunshineRenderer(params: ICellRendererParams): HTMLElement {
  const p2 = params as ImageCellRendererParams;
  const daysSunshine = params.value / 24
  return createImageSpan(daysSunshine, p2.rendererImage)
}

/**
 *  Cell Renderer by Property (using the grid options parameter)
 */
function rainPerTenMmRenderer(params: ICellRendererParams) {
  const p2 = params as ImageCellRendererParams;
  const rainPerTenMm = params.value / 10
  return createImageSpan(rainPerTenMm, p2.rendererImage)
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
    cellRenderer: deltaIndicator, // Function cell renderer
  },
  {
    headerName: 'Min Temp (˚C)',
    field: 'Min temp (C)',
    width: 120,
    cellRenderer: deltaIndicator, // Function cell renderer
  },
  {
    headerName: 'Days of Air Frost',
    field: 'Days of air frost (days)',
    width: 233,
    cellRenderer: DaysFrostRenderer, // Component Cell Renderer
    cellRendererParams: {
      rendererImage: 'frost.png', // Complementing the Cell Renderer parameters
    },
  },
  {
    headerName: 'Days Sunshine',
    field: 'Sunshine (hours)',
    width: 190,
    cellRenderer: daysSunshineRenderer,
    cellRendererParams: {
      rendererImage: 'sun.png', // Complementing the Cell Renderer parameters
    },
  },
  {
    headerName: 'Rainfall (10mm)',
    field: 'Rainfall (mm)',
    width: 180,
    cellRenderer: rainPerTenMmRenderer,
    cellRendererParams: {
      rendererImage: 'rain.png', // Complementing the Cell Renderer parameters
    },
  },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  rowData: null,
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
function frostierYear(extraDaysFrost: number) {
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
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/weather-se-england.json')
    .then(response => response.json())
    .then(data => {
      gridOptions.api!.setRowData(data)
    })
})
