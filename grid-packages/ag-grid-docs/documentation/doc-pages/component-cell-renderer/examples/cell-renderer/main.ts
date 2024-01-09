import { ColDef, GridApi, createGrid, GridOptions, ICellRendererParams } from '@ag-grid-community/core';
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

let gridApi: GridApi;

let frostPrefix = false;

function getColumnDefs() {
  return [
    {
      headerName: 'Month',
      field: 'Month',
      width: 75,
      cellStyle: { backgroundColor: '#CC222244' },
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
        showPrefix: frostPrefix,
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
  ];
}

const gridOptions: GridOptions = {
  columnDefs: getColumnDefs(),
  rowData: null,
  defaultColDef: {
    editable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
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
  gridApi!.forEachNode(rowNode => {
    rowNode.setDataValue(
      'Days of air frost (days)',
      rowNode.data['Days of air frost (days)'] + extraDaysFrost
    )
  })
}

function togglePrefix() {
  frostPrefix = !frostPrefix;
  gridApi.setGridOption('columnDefs', getColumnDefs());
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/weather-se-england.json')
    .then(response => response.json())
    .then(data => {
      gridApi!.setGridOption('rowData', data)
    })
})
