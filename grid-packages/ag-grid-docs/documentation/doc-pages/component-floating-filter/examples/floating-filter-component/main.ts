import { ColDef, GridApi, createGrid, GridOptions, INumberFilterParams } from '@ag-grid-community/core';
import { getData } from "./data";
import { SliderFloatingFilter } from './sliderFloatingFilter_typescript';

const filterParams: INumberFilterParams = {
  filterOptions: ['greaterThan'],
  maxNumConditions: 1,
};

const columnDefs: ColDef[] = [
  { field: 'country', filter: false },
  { field: 'language', filter: false },
  { field: 'name', filter: false },
  {
    field: 'gold',
    filter: 'agNumberColumnFilter',
    filterParams: filterParams,
    floatingFilterComponent: SliderFloatingFilter,
    floatingFilterComponentParams: {
      maxValue: 7,
      suppressFilterButton: true,
    },
    suppressMenu: false,
  },
  {
    field: 'silver',
    filter: 'agNumberColumnFilter',
    filterParams: filterParams,
    floatingFilterComponent: SliderFloatingFilter,
    floatingFilterComponentParams: {
      maxValue: 5,
      suppressFilterButton: true,
    },
    suppressMenu: false,
  },
  {
    field: 'bronze',
    filter: 'agNumberColumnFilter',
    filterParams: filterParams,
    floatingFilterComponent: SliderFloatingFilter,
    floatingFilterComponentParams: {
      maxValue: 10,
      suppressFilterButton: true,
    },
    suppressMenu: false,
  },
]

let gridApi: GridApi;

const gridOptions: GridOptions = {
  defaultColDef: {
    editable: true,
    minWidth: 100,
    filter: true,
    floatingFilter: true,
  },
  columnDefs: columnDefs,
  rowData: getData(),
  autoSizeStrategy: {
    type: 'fitGridWidth',
  },
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})
