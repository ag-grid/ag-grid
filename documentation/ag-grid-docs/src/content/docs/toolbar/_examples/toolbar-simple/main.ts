import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    CsvExportModule,
    ModuleRegistry,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    SideBarModule,
    ToolbarModule,
} from 'ag-grid-enterprise';

import { CustomToolbarButton } from './customToolbarItem_typescript';

ModuleRegistry.registerModules([
    TextFilterModule,
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    CsvExportModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    SideBarModule,
    ToolbarModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', minWidth: 200 },
        { field: 'country', minWidth: 200 },
        { field: 'sport', minWidth: 200 },
        { field: 'year' },
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
    sideBar: { toolPanels: ['columns', 'filters'], defaultToolPanel: '' },
    toolbar: {
        items: [
            {
                toolbarItem: CustomToolbarButton,
                key: 'autoSizeAll',
                toolbarItemParams: {
                    label: 'Auto Size All',
                    onClick: (api: GridApi) => api.autoSizeAllColumns(),
                },
            },
            {
                toolbarItem: CustomToolbarButton,
                key: 'columnChooser',
                toolbarItemParams: {
                    label: 'Choose Columns',
                    onClick: (api: GridApi) => api.showColumnChooser(),
                },
            },
            'separator',
            {
                toolbarItem: CustomToolbarButton,
                key: 'columnsPanel',
                toolbarItemParams: {
                    label: 'Columns Panel',
                    onClick: (api: GridApi) =>
                        api.getOpenedToolPanel() === 'columns' ? api.closeToolPanel() : api.openToolPanel('columns'),
                },
            },
            {
                toolbarItem: CustomToolbarButton,
                key: 'filtersPanel',
                toolbarItemParams: {
                    label: 'Filters Panel',
                    onClick: (api: GridApi) =>
                        api.getOpenedToolPanel() === 'filters' ? api.closeToolPanel() : api.openToolPanel('filters'),
                },
            },
            'separator',
            {
                toolbarItem: CustomToolbarButton,
                key: 'csvExport',
                toolbarItemParams: {
                    label: 'CSV Export',
                    onClick: (api: GridApi) => api.exportDataAsCsv(),
                },
            },
            {
                toolbarItem: CustomToolbarButton,
                key: 'excelExport',
                toolbarItemParams: {
                    label: 'Excel Export',
                    onClick: (api: GridApi) => api.exportDataAsExcel(),
                },
            },
            'separator',
            {
                toolbarItem: CustomToolbarButton,
                key: 'resetColumns',
                toolbarItemParams: {
                    label: 'Reset Columns',
                    onClick: (api: GridApi) => api.resetColumnState(),
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
