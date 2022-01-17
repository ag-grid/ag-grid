import { Grid, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [{ field: 'company' }, { field: 'url', cellClass: 'hyperlinks' }],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    resizable: true,
  },
  defaultExcelExportParams: {
    autoConvertFormulas: true,
    processCellCallback: params => {
      const field = params.column.getColDef().field
      return field === 'url' ? `=HYPERLINK("${params.value}")` : params.value
    },
  },
  excelStyles: [
    {
      id: 'hyperlinks',
      font: {
        underline: 'Single',
        color: '#358ccb',
      },
    },
  ],

  rowData: [
    { company: 'Google', url: 'https://www.google.com' },
    { company: 'Adobe', url: 'https://www.adobe.com' },
    { company: 'The New York Times', url: 'https://www.nytimes.com' },
    { company: 'Twitter', url: 'https://www.twitter.com' },
    { company: 'StackOverflow', url: 'https://stackoverflow.com/' },
    { company: 'Reddit', url: 'https://www.reddit.com' },
    { company: 'Github', url: 'https://www.github.com' },
    { company: 'Microsoft', url: 'https://www.microsoft.com' },
    { company: 'Gizmodo', url: 'https://www.gizmodo.com' },
    { company: 'LinkedIN', url: 'https://www.linkedin.com' },
  ],
}

function onBtExport() {
  gridOptions.api!.exportDataAsExcel()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
