import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';
import { getData } from "./data";

let api: GridApi;

const gridOptions: GridOptions = {
  rowData: getData(),
  columnDefs: [
    { headerName: 'Employee', field: 'employee' },
    { headerName: 'Number Sick Days', field: 'sickDays', editable: true },
  ],
  rowClassRules: {
    // row style function
    'sick-days-warning': (params) => {
      var numSickDays = params.data.sickDays
      return numSickDays > 5 && numSickDays <= 7
    },
    // row style expression
    'sick-days-breach': 'data.sickDays >= 8',
  },
}

function setDataValue() {
  api!.forEachNode(function (rowNode) {
    rowNode.setDataValue('sickDays', randomInt())
  })
}

function setData() {
  api!.forEachNode(function (rowNode) {
    var newData = {
      employee: rowNode.data.employee,
      sickDays: randomInt(),
    }
    rowNode.setData(newData)
  })
}

function applyTransaction() {
  var itemsToUpdate: any[] = []
  api!.forEachNode(function (rowNode) {
    var data = rowNode.data
    data.sickDays = randomInt()
    itemsToUpdate.push(data)
  })
  api!.applyTransaction({ update: itemsToUpdate })
}

function randomInt() {
  return Math.floor(Math.random() * 10)
}

// wait for the document to be loaded, otherwise
// AG Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function () {
  var eGridDiv = document.querySelector<HTMLElement>('#myGrid')!
  api = createGrid(eGridDiv, gridOptions);;
})
