import {
  FirstDataRenderedEvent,
  GridApi,
  createGrid,
  GridOptions,
  IFiltersToolPanel,
} from '@ag-grid-community/core';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { ModuleRegistry } from "@ag-grid-community/core";

ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnsToolPanelModule, FiltersToolPanelModule, MenuModule, SetFilterModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
  columnDefs: [
    {
      headerName: 'Set Filter Column',
      field: 'col1',
      filter: 'agSetColumnFilter',
      flex: 1,
      editable: true,
    },
  ],
  sideBar: 'filters',
  rowData: getRowData(),
  onFirstDataRendered: onFirstDataRendered,
}

function getRowData() {
  return [{ col1: 'A' }, { col1: 'A' }, { col1: 'B' }, { col1: 'C' }]
}

function setNewData() {
  var newData = [
    { col1: 'A' },
    { col1: 'A' },
    { col1: 'B' },
    { col1: 'C' },
    { col1: 'D' },
    { col1: 'E' },
  ]
  gridApi!.setGridOption('rowData', newData)
}

function reset() {
  gridApi!.setFilterModel(null);
  gridApi!.setGridOption('rowData', getRowData());
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  params.api.getToolPanelInstance('filters')!.expandFilters();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})