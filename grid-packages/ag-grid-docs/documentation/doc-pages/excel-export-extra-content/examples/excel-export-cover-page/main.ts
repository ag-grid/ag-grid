import { Grid, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
    flex: 1,
  },

  columnDefs: [
    { field: 'athlete', minWidth: 200 },
    { field: 'country', minWidth: 200 },
    { field: 'sport', minWidth: 150 },
    { field: 'gold', hide: true },
    { field: 'silver', hide: true },
    { field: 'bronze', hide: true },
    { field: 'total', hide: true },
  ],

  excelStyles: [
    {
      id: 'coverHeading',
      font: {
        size: 26,
        bold: true,
      },
    },
    {
      id: 'coverText',
      font: {
        size: 14,
      },
    },
  ],
}

function onBtExport() {
  const spreadsheets = []

  //set a filter condition ensuring no records are returned so only the header content is exported
  const filterInstance = gridOptions.api!.getFilterInstance('athlete')!

  filterInstance.setModel({
    values: [],
  })

  gridOptions.api!.onFilterChanged()

  //export custom content for cover page
  spreadsheets.push(
    gridOptions.api!.getSheetDataForExcel({
      prependContent: [
        [
          {
            styleId: 'coverHeading',
            mergeAcross: 3,
            data: { value: 'AG Grid', type: 'String' },
          },
        ],
        [
          {
            styleId: 'coverHeading',
            mergeAcross: 3,
            data: { value: '', type: 'String' },
          },
        ],
        [
          {
            styleId: 'coverText',
            mergeAcross: 3,
            data: {
              value:
                'Data shown lists Olympic medal winners for years 2000-2012',
              type: 'String',
            },
          },
        ],
        [
          {
            styleId: 'coverText',
            data: {
              value:
                'This data includes a row for each participation record - athlete name, country, year, sport, count of gold, silver, bronze medals won during the sports event',
              type: 'String',
            },
          },
        ],
      ],
      processHeaderCallback: () => '',
      sheetName: 'cover',
    })!
  )

  //remove filter condition set above so all the grid data can be exported on a separate sheet
  filterInstance.setModel(null)
  gridOptions.api!.onFilterChanged()

  spreadsheets.push(gridOptions.api!.getSheetDataForExcel()!)

  gridOptions.api!.exportMultipleSheetsAsExcel({
    data: spreadsheets,
    fileName: 'ag-grid.xlsx',
  })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
    .then(response => response.json())
    .then(data =>
      gridOptions.api!.setRowData(data.filter((rec: any) => rec.country != null))
    )
})
