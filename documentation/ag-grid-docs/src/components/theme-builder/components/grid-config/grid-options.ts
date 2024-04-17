import type { ColDef, ColGroupDef, GridOptions } from '@ag-grid-community/core';

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
  'rightToLeft',
  'floatingFilters',
  'printLayout',
  'legacyColumnMenu',
  'showIntegratedChartPopup',
  'statusBar',
  'pagination',
  'showOverlay',
] as const;

type GridConfigBooleanField = (typeof gridConfigBooleanFields)[number];

export type GridConfig = {
  [K in GridConfigBooleanField]?: boolean;
};

export const buildGridOptions = (config: GridConfig): GridOptions => {
  const defaultColDef: ColDef = {
    sortable: true,
    resizable: config.columnResizing,
    enableRowGroup: true,
    floatingFilter: config.floatingFilters,
    editable: true,
    flex: config.printLayout ? undefined : 1,
  };
  const columnDefs = buildSimpleColumnDefs();
  const sideBar: string[] = [];
  const options: GridOptions = {
    defaultColDef,
    sideBar,
    enableCharts: true,
    columnHoverHighlight: config.columnHover,
    enableRangeSelection: true,
    rowData: defaultRowData(),
    columnDefs: config.columnGroups ? buildGroupColumnDefs(columnDefs) : columnDefs,
    enableRtl: config.rightToLeft,
    domLayout: config.printLayout ? 'print' : undefined,
    columnMenu: config.legacyColumnMenu ? 'legacy' : 'new',
    animateRows: false,
  };

  if (config.advancedFilter) {
    options.enableAdvancedFilter = true;
    options.advancedFilterBuilderParams = {
      showMoveButtons: true,
    };
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
        return params.api.getRowGroupColumns().length === 0;
      };
      columnDefs[0].headerCheckboxSelection = (params) => {
        // we put checkbox on the name if we are not doing grouping
        return params.api.getRowGroupColumns().length === 0;
      };
    }
  }

  if (config.statusBar) {
    options.statusBar = {
      statusPanels: [
        {
          statusPanel: 'agTotalRowCountComponent',
          align: 'left',
        },
        {
          statusPanel: 'agFilteredRowCountComponent',
          align: 'left',
        },
        { statusPanel: 'agSelectedRowCountComponent', align: 'left' },
        { statusPanel: 'agAggregationComponent', align: 'right' },
      ],
    };
  }

  if (config.pagination) {
    options.pagination = true;
    options.paginationPageSize = 5;
    options.paginationPageSizeSelector = [5, 10, 25, 50, 100];
  }

  return options;
};

const buildSimpleColumnDefs = (): ColDef[] => [
  { field: 'make' },
  {
    field: 'model',
    filter: 'agSetColumnFilter',
    filterParams: {
      buttons: ['reset', 'apply'],
    },
    cellEditor: 'agRichSelectCellEditor',
    cellEditorParams: {
      values: Array.from(new Set(defaultRowData().map((row) => row.model))).sort(),
    },
  },
  { field: 'year' },
  { field: 'price' },
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
  // {
  //   headerName: 'Data',
  //   children: [
  //     {
  //       headerName: 'Year',
  //       children: columns.filter((c) => c.field === 'year'),
  //     },
  //     {
  //       headerName: 'Price',
  //       children: columns.filter((c) => c.field === 'price'),
  //     },
  //   ],
  // },
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
