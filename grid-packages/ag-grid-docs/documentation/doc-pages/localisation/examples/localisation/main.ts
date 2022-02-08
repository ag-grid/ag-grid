import { Grid, ColDef, GridOptions, ICellRendererParams, ICellRendererComp } from '@ag-grid-community/core'
import { doc } from "prettier";

declare var AG_GRID_LOCALE_ZZZ: {
  [key: string]: string;
};

class NodeIdRenderer implements ICellRendererComp {
  eGui!: HTMLElement;

  init(params: ICellRendererParams) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = params.node!.id! + 1;
  }

  getGui() {
    return this.eGui;
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }
}

const columnDefs: ColDef[] = [
  // this row just shows the row index, doesn't use any data from the row
  {
    headerName: '#',
    cellRenderer: NodeIdRenderer,
    checkboxSelection: true,
    headerCheckboxSelection: true,
  },
  { field: 'athlete', filterParams: { buttons: ['clear', 'reset', 'apply'] } },
  {
    field: 'age',
    filterParams: { buttons: ['apply', 'cancel'] },
    enablePivot: true,
  },
  { field: 'country', enableRowGroup: true },
  { field: 'year', filter: 'agNumberColumnFilter' },
  { field: 'date' },
  {
    field: 'sport',
    filter: 'agMultiColumnFilter',
    filterParams: {
      filters: [
        {
          filter: 'agTextColumnFilter',
          display: 'accordion',
        },
        {
          filter: 'agSetColumnFilter',
          display: 'accordion',
        },
      ],
    },
  },
  { field: 'gold', enableValue: true },
  { field: 'silver', enableValue: true },
  { field: 'bronze', enableValue: true },
  { field: 'total', enableValue: true },
]

var localeText = AG_GRID_LOCALE_ZZZ

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    editable: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  },
  sideBar: true,
  statusBar: {
    statusPanels: [
      { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
      { statusPanel: 'agAggregationComponent' },
    ],
  },
  rowGroupPanelShow: 'always',
  pagination: true,
  paginationPageSize: 500,
  enableRangeSelection: true,
  enableCharts: true,
  localeText: localeText,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
