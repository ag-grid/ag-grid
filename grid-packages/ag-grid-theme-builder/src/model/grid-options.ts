import { ColDef, ColGroupDef, GridOptions } from '@ag-grid-community/core';

export const gridConfigBooleanFields = [
  'advancedFilter',
  'filtersToolPanel',
  'columnsToolPanel',
  'columnGroups',
  'columnHover',
  'rowGrouping',
  'columnResizing',
  'rowDrag',
  'rowSelection',
  'integratedCharts',
] as const;

type GridConfigBooleanField = (typeof gridConfigBooleanFields)[number];

export type GridConfig = {
  [K in GridConfigBooleanField]?: boolean;
};

export const buildGridOptions = (
  config: GridConfig,
  icons?: Record<string, string>,
): GridOptions => {
  const defaultColDef: ColDef = {
    sortable: true,
    resizable: config.columnResizing,
    enableRowGroup: true,
  };
  const columnDefs = buildSimpleColumnDefs();
  const sideBar: string[] = [];
  const options: GridOptions = {
    defaultColDef,
    sideBar,
    enableCharts: config.integratedCharts,
    columnHoverHighlight: config.columnHover,
    enableRangeSelection: true,
    rowData: defaultRowData(),
    columnDefs: config.columnGroups ? buildGroupColumnDefs(columnDefs) : columnDefs,
    icons,
  };

  if (config.advancedFilter) {
    debugger;
    options.enableAdvancedFilter = true;
    defaultColDef.filter = true;
  }

  if (config.columnsToolPanel) {
    sideBar.push('columns');
  }

  if (config.filtersToolPanel) {
    sideBar.push('filters');
    defaultColDef.filter = true;
  }

  if (config.rowDrag) {
    columnDefs[0].rowDrag = true;
  }

  if (config.rowGrouping) {
    columnDefs[0].rowGroup = true;
    columnDefs[1].rowGroup = true;
    options.rowGroupPanelShow = 'always';
  }

  if (config.rowSelection) {
    options.rowSelection = 'multiple';
    options.autoGroupColumnDef = {
      headerName: 'Group',
      field: 'name',
      headerCheckboxSelection: true,
      cellRendererParams: {
        checkbox: true,
      },
    };
    if (!config.rowGrouping) {
      columnDefs[0].checkboxSelection = (params) => {
        // we put checkbox on the name if we are not doing grouping
        debugger;
        return params.api.getRowGroupColumns().length === 0;
      };
      columnDefs[0].headerCheckboxSelection = (params) => {
        debugger;
        // we put checkbox on the name if we are not doing grouping
        return params.api.getRowGroupColumns().length === 0;
      };
    }
  }

  return options;
};

const buildSimpleColumnDefs = (): ColDef[] => [
  { field: 'make', flex: 1 },
  {
    field: 'model',
    flex: 1,
    filter: 'agSetColumnFilter',
    filterParams: {
      buttons: ['reset', 'apply'],
    },
  },
  { field: 'year', flex: 1 },
  { field: 'price', flex: 1 },
];

const buildGroupColumnDefs = (columns: ColDef[]): ColGroupDef[] => [
  {
    headerName: 'Car',
    children: columns.filter((c) => c.field === 'make' || c.field === 'model'),
  },
  {
    headerName: 'Data',
    children: columns.filter((c) => c.field !== 'make' && c.field !== 'model'),
  },
];

const defaultRowData = () => [
  { make: 'Toyota', model: 'Celica', year: 2001, price: 35000 },
  { make: 'Toyota', model: 'Celica', year: 2002, price: 36000 },
  { make: 'Toyota', model: 'Celica', year: 2003, price: 37000 },
  { make: 'Toyota', model: 'Celica', year: 2004, price: 38000 },
  { make: 'Toyota', model: 'Celica', year: 2005, price: 39000 },
  { make: 'Ford', model: 'Mondeo', year: 2001, price: 32000 },
  { make: 'Ford', model: 'Mondeo', year: 2002, price: 33000 },
  { make: 'Ford', model: 'Mondeo', year: 2003, price: 34000 },
  { make: 'Ford', model: 'Mondeo', year: 2004, price: 35000 },
  { make: 'Ford', model: 'Mondeo', year: 2005, price: 36000 },
  { make: 'Porsche', model: 'Boxster', year: 2001, price: 73000 },
  { make: 'Porsche', model: 'Boxster', year: 2002, price: 74000 },
  { make: 'Porsche', model: 'Boxster', year: 2003, price: 75000 },
  { make: 'Porsche', model: 'Boxster', year: 2004, price: 76000 },
  { make: 'Porsche', model: 'Boxster', year: 2005, price: 77000 },
];
