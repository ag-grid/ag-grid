import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    CsvExportModule,
    ModuleRegistry,
    NumberFilterModule,
    QuickFilterModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import {
    ContextMenuModule,
    ExcelExportModule,
    FindModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    ToolbarModule,
} from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    TextFilterModule,
    NumberFilterModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    ContextMenuModule,
    CsvExportModule,
    ExcelExportModule,
    QuickFilterModule,
    FindModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    ToolbarModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', minWidth: 200 },
        { field: 'country', minWidth: 200, enableRowGroup: true },
        { field: 'sport', minWidth: 200, enableRowGroup: true },
        { field: 'year', filter: 'agNumberColumnFilter' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
    },
    autoGroupColumnDef: { minWidth: 200 },
    toolbar: {
        alignment: 'right',
        items: [
            { toolbarItem: 'agRowGroupPanelToolbarItem', alignment: 'left' },
            'agQuickFilterToolbarItem',
            'separator',
            {
                key: 'autoSizeAll',
                label: 'Auto Size All',
                icon: 'maximize',
                action: (params) => params.api.autoSizeAllColumns(),
            },
            {
                key: 'resetColumns',
                label: 'Reset Columns',
                icon: 'columnMoveLeft',
                action: (params) => params.api.resetColumnState(),
            },
            {
                toolbarItem: 'agMenuToolbarItem',
                toolbarItemParams: {
                    label: 'Export',
                    icon: 'save',
                    menuItems: ['csvExport', 'excelExport'],
                },
            },
        ],
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
