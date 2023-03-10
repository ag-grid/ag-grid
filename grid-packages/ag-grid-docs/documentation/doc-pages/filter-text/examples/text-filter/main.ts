import { Grid, ColDef, GridOptions, ITextFilterParams } from '@ag-grid-community/core'

function contains(target: string, lookingFor: string) {
  return target && target.indexOf(lookingFor) >= 0
}

var athleteFilterParams: ITextFilterParams = {
  filterOptions: ['contains', 'notContains'],
  textFormatter: (r) => {
    if (r == null) return null

    return r
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/æ/g, 'ae')
      .replace(/ç/g, 'c')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/ñ/g, 'n')
      .replace(/[òóôõö]/g, 'o')
      .replace(/œ/g, 'oe')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ýÿ]/g, 'y')
  },
  debounceMs: 200,
  maxConditionCount: 1,
};

var countryFilterParams: ITextFilterParams = {
  filterOptions: ['contains'],
  textMatcher: ({ value, filterText }) => {
    var filterTextLowerCase = filterText ? filterText.toLowerCase() : '';
    var valueLowerCase = value.toString().toLowerCase()
    var aliases: Record<string, string> = {
      usa: 'united states',
      holland: 'netherlands',
      vodka: 'russia',
      niall: 'ireland',
      sean: 'south africa',
      alberto: 'mexico',
      john: 'australia',
      xi: 'china',
    }

    var literalMatch = contains(valueLowerCase, filterTextLowerCase)

    return (
      !!literalMatch || !!contains(valueLowerCase, aliases[filterTextLowerCase])
    )
  },
  trimInput: true,
  debounceMs: 1000,
};

const columnDefs: ColDef[] = [
  {
    field: 'athlete',
    filterParams: athleteFilterParams,
  },
  {
    field: 'country',
    filter: 'agTextColumnFilter',
    filterParams: countryFilterParams,
  },
  {
    field: 'sport',
    filter: 'agTextColumnFilter',
    filterParams: {
      caseSensitive: true,
      defaultOption: 'startsWith',
    } as ITextFilterParams,
  },
]

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    flex: 1,
    sortable: true,
    filter: true,
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
