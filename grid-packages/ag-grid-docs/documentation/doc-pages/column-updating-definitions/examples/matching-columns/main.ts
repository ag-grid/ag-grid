import { Grid, GridOptions, ValueGetterParams } from '@ag-grid-community/core'

const athleteColumn = {
  headerName: 'Athlete',
  valueGetter: (params: ValueGetterParams<IOlympicData>) => {
    return params.data ? params.data.athlete : undefined;
  },
}

function getColDefsMedalsIncluded() {
  return [
    athleteColumn,
    {
      colId: 'myAgeCol',
      headerName: 'Age',
      valueGetter: (params: ValueGetterParams<IOlympicData>) => {
        return params.data ? params.data.age : undefined;
      },
    },
    {
      headerName: 'Country',
      headerClass: 'country-header',
      valueGetter: (params: ValueGetterParams<IOlympicData>) => {
        return params.data ? params.data.country : undefined;
      },
    },
    { field: 'sport' },
    { field: 'year' },
    { field: 'date' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ]
}

function getColDefsMedalsExcluded() {
  return [
    athleteColumn,
    {
      colId: 'myAgeCol',
      headerName: 'Age',
      valueGetter: (params: ValueGetterParams<IOlympicData>) => {
        return params.data ? params.data.age : undefined;
      },
    },
    {
      headerName: 'Country',
      headerClass: 'country-header',
      valueGetter: (params: ValueGetterParams<IOlympicData>) => {
        return params.data ? params.data.country : undefined;
      },
    },
    { field: 'sport' },
    { field: 'year' },
    { field: 'date' },
  ]
}

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    initialWidth: 100,
    sortable: true,
    resizable: true,
  },
  columnDefs: getColDefsMedalsIncluded(),
}

function onBtExcludeMedalColumns() {
  gridOptions.api!.setColumnDefs(getColDefsMedalsExcluded())
}

function onBtIncludeMedalColumns() {
  gridOptions.api!.setColumnDefs(getColDefsMedalsIncluded())
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
