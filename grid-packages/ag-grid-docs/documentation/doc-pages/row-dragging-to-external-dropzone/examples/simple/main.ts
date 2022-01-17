import { Grid, ColDef, GridOptions, GridReadyEvent, RowDropZoneParams } from '@ag-grid-community/core'

var rowIdSequence = 100

const columnDefs: ColDef[] = [
  { field: 'id', rowDrag: true },
  { field: 'color' },
  { field: 'value1' },
  { field: 'value2' },
]

const gridOptions: GridOptions = {
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
  },
  rowClassRules: {
    'red-row': 'data.color == "Red"',
    'green-row': 'data.color == "Green"',
    'blue-row': 'data.color == "Blue"',
  },
  rowData: createRowData(),
  rowDragManaged: true,
  columnDefs: columnDefs,
  animateRows: true,
  onGridReady: function (params) {
    addDropZones(params)
    addCheckboxListener(params)
  },
}

function addCheckboxListener(params: GridReadyEvent) {
  var checkbox = document.querySelector('input[type=checkbox]')! as any;

  checkbox.addEventListener('change', function () {
    params.api.setSuppressMoveWhenRowDragging(checkbox.checked)
  })
}

function createRowData() {
  var data: any[] = [];
  [
    'Red',
    'Green',
    'Blue',
    'Red',
    'Green',
    'Blue',
    'Red',
    'Green',
    'Blue',
  ].forEach(function (color) {
    var newDataItem = {
      id: rowIdSequence++,
      color: color,
      value1: Math.floor(Math.random() * 100),
      value2: Math.floor(Math.random() * 100),
    }
    data.push(newDataItem)
  })
  return data
}

function createTile(data: any) {
  var el = document.createElement('div')

  el.classList.add('tile')
  el.classList.add(data.color.toLowerCase())
  el.innerHTML =
    '<div class="id">' +
    data.id +
    '</div>' +
    '<div class="value">' +
    data.value1 +
    '</div>' +
    '<div class="value">' +
    data.value2 +
    '</div>'

  return el
}

function addDropZones(params: GridReadyEvent) {
  var tileContainer = document.querySelector('.tile-container') as any;
  var dropZone: RowDropZoneParams = {
    getContainer: function () {
      return tileContainer as any;
    },
    onDragStop: function (params) {
      var tile = createTile(params.node.data)
      tileContainer.appendChild(tile)
    },
  }

  params.api.addRowDropZone(dropZone)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!

  new Grid(gridDiv, gridOptions)
})
