import { GridApi, createGrid, ColDef, GridOptions, INumberFilterParams } from '@ag-grid-community/core';

const columnDefs: ColDef[] = [
  { field: 'athlete' },
  {
    field: 'age',
    maxWidth: 120,
    filter: 'agNumberColumnFilter',
    filterParams: {
      includeBlanksInEquals: false,
      includeBlanksInLessThan: false,
      includeBlanksInGreaterThan: false,
      includeBlanksInRange: false,
    } as INumberFilterParams,
  },
  {
    headerName: 'Description',
    valueGetter: '"Age is " + data.age',
    minWidth: 340,
  },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    filter: true,
  },
}

function changeNull(toChange: string, value: boolean) {
  switch (toChange) {
    case 'equals':
      columnDefs[1].filterParams.includeBlanksInEquals = value
      break
    case 'lessThan':
      columnDefs[1].filterParams.includeBlanksInLessThan = value
      break
    case 'greaterThan':
      columnDefs[1].filterParams.includeBlanksInGreaterThan = value
      break
    case 'inRange':
      columnDefs[1].filterParams.includeBlanksInRange = value
      break
  }

  var filterModel = gridApi!.getFilterModel()

  gridApi!.setGridOption('columnDefs', columnDefs)
  gridApi!.destroyFilter('age')
  gridApi!.setFilterModel(filterModel)
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi = createGrid(gridDiv, gridOptions);

gridApi.setGridOption('rowData', [
  {
    athlete: 'Alberto Gutierrez',
    age: 36,
  },
  {
    athlete: 'Niall Crosby',
    age: 40,
  },
  {
    athlete: 'Sean Landsman',
    age: null,
  },
  {
    athlete: 'Robert Clarke',
    age: undefined,
  },
])
