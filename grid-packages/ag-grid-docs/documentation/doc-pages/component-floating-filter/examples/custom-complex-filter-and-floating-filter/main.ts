import { Grid, ColDef, GridOptions, ITextFilterParams, INumberFilterParams, IDateFilterParams } from '@ag-grid-community/core'

import { CustomNumberFilter } from "./custom-number-filter_typescript";
import { NumberFloatingFilter, CustomFloatingParams } from "./number-floating-filter_typescript";

const columnDefs: ColDef[] = [
  {
    field: 'athlete',
    minWidth: 150,
    filter: 'agTextColumnFilter',
    filterParams: {
      debounceMs: 2000,
    } as ITextFilterParams,
  },
  {
    field: 'age',
    filter: 'agNumberColumnFilter',
    filterParams: {
      debounceMs: 0,
    } as INumberFilterParams,
  },
  { field: 'country' },
  { field: 'year' },
  {
    field: 'date',
    minWidth: 180,
    filter: 'agDateColumnFilter',
    filterParams: {
      comparator: function (
        filterLocalDateAtMidnight: Date,
        cellValue: string
      ) {
        var dateAsString = cellValue
        var dateParts = dateAsString.split('/')
        var cellDate = new Date(
          Number(dateParts[2]),
          Number(dateParts[1]) - 1,
          Number(dateParts[0])
        )

        if (filterLocalDateAtMidnight.getTime() == cellDate.getTime()) {
          return 0
        }

        if (cellDate < filterLocalDateAtMidnight) {
          return -1
        }

        if (cellDate > filterLocalDateAtMidnight) {
          return 1
        }
      },
    } as IDateFilterParams,
    floatingFilterComponentParams: {
      suppressFilterButton: true,
    },
  },
  { field: 'sport' },
  {
    field: 'gold',
    floatingFilterComponent: NumberFloatingFilter,
    floatingFilterComponentParams: {
      maxValue: 7,
      suppressFilterButton: true,
    } as CustomFloatingParams,
    filter: CustomNumberFilter,
  },
  {
    field: 'silver',
    floatingFilterComponent: NumberFloatingFilter,
    floatingFilterComponentParams: {
      maxValue: 3,
      suppressFilterButton: true,
    } as CustomFloatingParams,
    filter: CustomNumberFilter,
  },
  {
    field: 'bronze',
    floatingFilterComponent: NumberFloatingFilter,
    floatingFilterComponentParams: {
      maxValue: 2,
      suppressFilterButton: true,
    } as CustomFloatingParams,
    filter: CustomNumberFilter,
  },
  {
    field: 'total',
    floatingFilterComponent: NumberFloatingFilter,
    floatingFilterComponentParams: {
      maxValue: 5,
      suppressFilterButton: true,
    } as CustomFloatingParams,
    filter: CustomNumberFilter,
  },
]

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    editable: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    floatingFilter: true,
    resizable: true,
  },
  columnDefs: columnDefs,
  rowData: null,
}



// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
