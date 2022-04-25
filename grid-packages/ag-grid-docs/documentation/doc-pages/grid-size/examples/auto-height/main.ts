import { Grid, ColGroupDef, GridOptions } from '@ag-grid-community/core'

const columnDefs: ColGroupDef[] = [
  {
    headerName: 'Core',
    children: [
      { headerName: 'ID', field: 'id' },
      { field: 'make' },
      { field: 'price', filter: 'agNumberColumnFilter' },
    ],
  },
  {
    headerName: 'Extra',
    children: [
      { field: 'val1', filter: 'agNumberColumnFilter' },
      { field: 'val2', filter: 'agNumberColumnFilter' },
      { field: 'val3', filter: 'agNumberColumnFilter' },
      { field: 'val4', filter: 'agNumberColumnFilter' },
      { field: 'val5', filter: 'agNumberColumnFilter' },
      { field: 'val6', filter: 'agNumberColumnFilter' },
      { field: 'val7', filter: 'agNumberColumnFilter' },
      { field: 'val8', filter: 'agNumberColumnFilter' },
      { field: 'val9', filter: 'agNumberColumnFilter' },
      { field: 'val10', filter: 'agNumberColumnFilter' },
    ],
  },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    enableRowGroup: true,
    enablePivot: true,
    enableValue: true,
    sortable: true,
    filter: true,
    resizable: true,
  },
  rowData: getData(5),
  domLayout: 'autoHeight',
  animateRows: true,
  onGridReady: (params) => {
    document.querySelector('#currentRowCount')!.innerHTML = '5'
  },
  popupParent: document.body,
}

function createRow(index: number) {
  var makes = ['Toyota', 'Ford', 'BMW', 'Phantom', 'Porsche']

  return {
    id: 'D' + (1000 + index),
    make: makes[Math.floor(Math.random() * makes.length)],
    price: Math.floor(Math.random() * 100000),
    val1: Math.floor(Math.random() * 1000),
    val2: Math.floor(Math.random() * 1000),
    val3: Math.floor(Math.random() * 1000),
    val4: Math.floor(Math.random() * 1000),
    val5: Math.floor(Math.random() * 1000),
    val6: Math.floor(Math.random() * 1000),
    val7: Math.floor(Math.random() * 1000),
    val8: Math.floor(Math.random() * 1000),
    val9: Math.floor(Math.random() * 1000),
    val10: Math.floor(Math.random() * 1000),
  }
}

function getData(count: number) {
  var rowData = []
  for (var i = 0; i < count; i++) {
    rowData.push(createRow(i))
  }
  return rowData
}

function updateRowData(rowCount: number) {
  gridOptions.api!.setRowData(getData(rowCount));

  document.querySelector('#currentRowCount')!.innerHTML = `${rowCount}`;
}

function cbFloatingRows() {
  var show = (document.getElementById('floating-rows') as HTMLInputElement).checked
  if (show) {
    gridOptions.api!.setPinnedTopRowData([createRow(999), createRow(998)])
    gridOptions.api!.setPinnedBottomRowData([createRow(997), createRow(996)])
  } else {
    gridOptions.api!.setPinnedTopRowData()
    gridOptions.api!.setPinnedBottomRowData()
  }
}

function setAutoHeight() {
  gridOptions.api!.setDomLayout('autoHeight');
  // auto height will get the grid to fill the height of the contents,
  // so the grid div should have no height set, the height is dynamic.
  (document.querySelector<HTMLElement>('#myGrid')! as any).style.height = ''
}

function setFixedHeight() {
  // we could also call setDomLayout() here as normal is the default
  gridOptions.api!.setDomLayout('normal');
  // when auto height is off, the grid ahs a fixed height, and then the grid
  // will provide scrollbars if the data does not fit into it.
  (document.querySelector<HTMLElement>('#myGrid')! as any)!.style.height = '400px'
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
