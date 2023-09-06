import { GridApi, createGrid, GridOptions, ValueFormatterParams, ValueGetterParams, KeyCreatorParams } from '@ag-grid-community/core'

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    {
      field: 'country',
      rowGroup: true,
      keyCreator: countryKeyCreator,
      valueGetter: countryValueGetter,
      valueFormatter: countryValueFormatter,
    },
    { field: 'athlete', minWidth: 200 },
    { field: 'total' },
    { field: 'sport', minWidth: 200 },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    resizable: true,
  },
  autoGroupColumnDef: {
    minWidth: 300,
  },
  groupDefaultExpanded: -1,
}

function countryValueFormatter(params: ValueFormatterParams) {
  if (!params.value) {
    return '';
  }
  return `[${params.value.code}] ${params.value.name}`;
}

function countryKeyCreator(params: KeyCreatorParams) {
  const countryObject = params.value;
  return countryObject.code;
}

function countryValueGetter(params: ValueGetterParams) {
  if (params.node?.group) {
    return undefined;
  }

  // hack the data  - replace the country with an object of country name and code
  const countryName = params.data.country;
  const countryCode = countryName.substring(0, 2).toUpperCase();
  return {
    name: countryName,
    code: countryCode,
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
