import { Grid, GridOptions, ISetFilterParams, KeyCreatorParams, ValueFormatterParams } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', rowGroup: true, hide: true },
    { field: 'sport', rowGroup: true, hide: true },
    { field: 'athlete', hide: true },
    {
      field: 'date',
      valueFormatter: (params) => params.value ? params.value.toLocaleDateString() : '',
      filter: 'agSetColumnFilter',
      filterParams: {
        comparator: (a: Date, b: Date) => (a > b ? 1 : (a < b ? -1 : 0)),
        keyCreator: (params: KeyCreatorParams) => params.value.toString(),
        treeList: true,
        treeListFormatter: treeListFormatter,
      } as ISetFilterParams<any, Date>
    },
    {
      field: 'gold',
      filter: 'agSetColumnFilter',
      filterParams: {
        treeList: true,
        treeListPathGetter: (gold: number) => gold != null ? [gold > 2 ? '>2' : '<=2', String(gold)] : [null]
      } as ISetFilterParams<any, number>,
    },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 200,
    resizable: true,
    floatingFilter: true,
  },
  autoGroupColumnDef: {
    field: 'athlete',
    filter: 'agSetColumnFilter',
    filterParams: {
      treeList: true,
      keyCreator: (params: KeyCreatorParams) => params.value ? params.value.join('#') : null
    } as ISetFilterParams,
  },
}

function treeListFormatter(pathKey: string | null, level: number): string {
  if (level === 1) {
    const date = new Date();
    date.setMonth(Number(pathKey) -1);
    return date.toLocaleDateString(undefined, {month: 'long'});
  }
  return pathKey || '';
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: any[]) => gridOptions.api!.setRowData(data.map(row => {
      const dateParts = row.date.split('/');
      const newDate = new Date(parseInt(dateParts[2]), dateParts[1] - 1, dateParts[0]);
      return {...row, date: newDate};
    })))
})
