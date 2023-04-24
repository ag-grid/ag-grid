import { Grid, ColDef, GridOptions, IDateFilterParams, IRowNode } from '@ag-grid-community/core'

var dateFilterParams: IDateFilterParams = {
  comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
    var cellDate = asDate(cellValue)

    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
      return 0
    }

    if (cellDate < filterLocalDateAtMidnight) {
      return -1
    }

    if (cellDate > filterLocalDateAtMidnight) {
      return 1
    }
    return 0;
  },
}

const columnDefs: ColDef[] = [
  { field: 'athlete', minWidth: 180 },
  { field: 'age', filter: 'agNumberColumnFilter', maxWidth: 80 },
  { field: 'country' },
  { field: 'year', maxWidth: 90 },
  {
    field: 'date',
    filter: 'agDateColumnFilter',
    filterParams: dateFilterParams,
  },
  { field: 'gold', filter: 'agNumberColumnFilter' },
  { field: 'silver', filter: 'agNumberColumnFilter' },
  { field: 'bronze', filter: 'agNumberColumnFilter' },
]

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 120,
    filter: true,
  },
  animateRows: true,
  isExternalFilterPresent: isExternalFilterPresent,
  doesExternalFilterPass: doesExternalFilterPass,
}

var ageType = 'everyone'

function isExternalFilterPresent(): boolean {
  // if ageType is not everyone, then we are filtering
  return ageType !== 'everyone'
}

function doesExternalFilterPass(node: IRowNode<IOlympicData>): boolean {
  if (node.data) {
    switch (ageType) {
      case 'below25':
        return node.data.age < 25
      case 'between25and50':
        return node.data.age >= 25 && node.data.age <= 50
      case 'above50':
        return node.data.age > 50
      case 'dateAfter2008':
        return asDate(node.data.date) > new Date(2008, 1, 1)
      default:
        return true
    }
  }
  return true;
}

function asDate(dateAsString: string) {
  var splitFields = dateAsString.split('/')
  return new Date(Number.parseInt(splitFields[2]), Number.parseInt(splitFields[1]) - 1, Number.parseInt(splitFields[0]))
}

function externalFilterChanged(newValue: string) {
  ageType = newValue
  gridOptions.api!.onFilterChanged()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(function (data) {
      (document.querySelector('#everyone') as HTMLInputElement).checked = true
      gridOptions.api!.setRowData(data)
    })
})
