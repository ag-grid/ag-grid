import { Grid, GridOptions } from '@ag-grid-community/core';
import { getData } from "./data";

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'symbol', maxWidth: 120 },
    { field: 'name', minWidth: 250 },
    {
      field: 'change',
      cellRenderer: 'agSparklineCellRenderer',
    },
    {
      field: 'volume',
      type: 'numericColumn',
      maxWidth: 140,
    },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    resizable: true,
  },
  rowData: getData(),
  rowHeight: 50,
}

var intervalId: any;

function start() {
  if (intervalId) {
    return
  }

  const updateData = () => {
    const itemsToUpdate: any[] = []
    gridOptions.api!.forEachNodeAfterFilterAndSort(function (rowNode) {
      const data = rowNode.data
      if (!data) {
        return;
      }
      const n = data.change.length
      const v =
        Math.random() > 0.5 ? Number(Math.random()) : -Number(Math.random())
      data.change = [...data.change.slice(1, n), v]
      itemsToUpdate.push(data)
    })
    gridOptions.api!.applyTransaction({ update: itemsToUpdate })
  };

  intervalId = setInterval(updateData, 300)
}

function stop() {
  if (intervalId === undefined) {
    return
  }
  clearInterval(intervalId)
  intervalId = undefined
}

// setup the grid after the page has finished loading

document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
