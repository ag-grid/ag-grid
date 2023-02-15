import { Grid, GridOptions, ISetFilterParams, KeyCreatorParams, ValueFormatterParams } from "@ag-grid-community/core";
import { getData } from "./data";

const pathLookup: { [key: string]: string } = getData().reduce((pathMap, row) => {
  pathMap[row.path.key] = row.path.displayValue;
  return pathMap;
}, {});

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'employmentType' },
    { field: 'jobTitle' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 200,
    resizable: true,
    filter: true,
  },
  autoGroupColumnDef: {
    headerName: 'Employee',
    field: 'path',
    cellRendererParams: {
      suppressCount: true,
    },
    filter: 'agSetColumnFilter',
    filterParams: {
      treeList: true,
      keyCreator: (params: KeyCreatorParams) => params.value.join('.'),
      treeListFormatter: treeListFormatter,
    } as ISetFilterParams<any, string[]>,
    minWidth: 280,
    valueFormatter: (params: ValueFormatterParams) => params.value.displayValue
  },
  treeData: true,
  animateRows: true,
  groupDefaultExpanded: -1,
  getDataPath: data => data.path.key.split('.'),
  rowData: getData(),
}

function treeListFormatter(pathKey: string | null, _level: number, parentPathKeys: (string | null)[]): string {
  return pathLookup[[...parentPathKeys, pathKey].join('.')];
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
