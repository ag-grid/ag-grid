import { Grid, GridOptions, HeaderValueGetterParams, ValueGetterParams } from '@ag-grid-community/core'

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    {
      field: 'athlete',
      filterParams: {
        caseSensitive: true,
        filterOptions: ['contains'],
      }
    },
    { field: 'country', rowGroup: true, hide: true },
    { field: 'sport', hide: true },
    { field: 'age', minWidth: 100, filter: false },
    {
      headerName: 'Medals (+)',
      children: [
        { field: 'gold', minWidth: 100 },
        { field: 'silver', minWidth: 100 },
        { field: 'bronze', minWidth: 100 },
      ]
    },
    {
      headerName: 'Medals (-)',
      children: [
        {
          field: 'gold',
          headerValueGetter: headerValueGetter('Gold'),
          valueGetter: valueGetter,
          minWidth: 100
        },
        {
          field: 'silver',
          headerValueGetter: headerValueGetter('Silver'),
          valueGetter: valueGetter,
          minWidth: 100
        },
        {
          field: 'bronze',
          headerValueGetter: headerValueGetter('Bronze'),
          valueGetter: valueGetter,
          minWidth: 100
        },
      ]
    },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 180,
    filter: true,
    sortable: true,
    resizable: true,
  },
  groupDefaultExpanded: 1,
  enableAdvancedFilter: true,
}

function headerValueGetter(columnName: string): HeaderValueGetterFunc<IOlympicData, number> {
  return (params: HeaderValueGetterParams<IOlympicData, number>) => params.location === 'advancedFilter' ? `${columnName} (-)` : columnName;
}

function valueGetter(params: ValueGetterParams<IOlympicData, number>) {
  return params.data ? params.data[params.colDef.field] * -1 : null,
}

var includeHiddenColumns = false;

function onIncludeHiddenColumnsToggled() {
  includeHiddenColumns = !includeHiddenColumns;
  gridOptions.api!.setIncludeHiddenColumnsInAdvancedFilter(includeHiddenColumns);
  document.querySelector('#includeHiddenColumns')!.innerHTML = `${includeHiddenColumns ? 'Exclude' : 'Include'} Hidden Columns`;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
