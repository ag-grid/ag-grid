import { ColDef, GridOptions } from '@ag-grid-community/core'
declare var MySimpleEditor: any;

const columnDefs: ColDef[] = [
  { field: 'first_name', headerName: 'First Name', width: 120, editable: true },
  { field: 'last_name', headerName: 'Last Name', width: 120, editable: true },
  {
    field: 'gender',
    width: 100,
    cellEditor: 'mySimpleEditor',
  },
  {
    field: 'age',
    width: 80,
    cellEditor: 'mySimpleEditor',
  },
  {
    field: 'mood',
    width: 90,
    cellEditor: 'mySimpleEditor',
  },
  {
    field: 'country',
    width: 110,
    cellEditor: 'mySimpleEditor',
  },
  {
    field: 'address',
    width: 502,
    cellEditor: 'mySimpleEditor',
  },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    editable: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  },
  rowData: getData(),
  components: {
    mySimpleEditor: MySimpleEditor,
  },
  onGridReady: function () {
    setInterval(() => {
      const instances = gridOptions.api!.getCellEditorInstances()
      if (instances.length > 0) {
        const instance = instances[0] as any;
        if (instance.myCustomFunction) {
          const result = instance.myCustomFunction()
          console.log(
            `found editing cell: row index = ${result.rowIndex}, column = ${result.colId}.`
          )
        } else {
          console.log(
            'found editing cell, but method myCustomFunction not found, must be the default editor.'
          )
        }
      } else {
        console.log('found not editing cell.')
      }
    }, 1000)
  },
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector('#myGrid')
  new agGrid.Grid(gridDiv, gridOptions)
})
