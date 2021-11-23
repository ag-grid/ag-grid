import { GridOptions, ICellRendererParams } from '@ag-grid-community/core'

declare var MoodRenderer: any;
declare var GenderRenderer: any;

const rowData = [
  { value: 14, type: 'age' },
  { value: 'female', type: 'gender' },
  { value: 'Happy', type: 'mood' },
  { value: 21, type: 'age' },
  { value: 'male', type: 'gender' },
  { value: 'Sad', type: 'mood' },
]

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'value' },
    {
      headerName: 'Rendered Value',
      field: 'value',
      cellRendererSelector: function (params: ICellRendererParams) {
        const moodDetails = {
          component: 'moodCellRenderer',
        }

        const genderDetails = {
          component: 'genderCellRenderer',
          params: { values: ['Male', 'Female'] },
        }

        if (params.data.type === 'gender') return genderDetails
        else if (params.data.type === 'mood') return moodDetails
        else return undefined
      },
    },
    { field: 'type' },
  ],
  defaultColDef: {
    flex: 1,
  },
  rowData: rowData,
  onRowEditingStarted: function (event) {
    console.log('never called - not doing row editing')
  },
  onRowEditingStopped: function (event) {
    console.log('never called - not doing row editing')
  },
  onCellEditingStarted: function (event) {
    console.log('cellEditingStarted')
  },
  onCellEditingStopped: function (event) {
    console.log('cellEditingStopped')
  },
  components: {
    genderCellRenderer: GenderRenderer,
    moodCellRenderer: MoodRenderer,
  },
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector('#myGrid')
  new agGrid.Grid(gridDiv, gridOptions)
})
