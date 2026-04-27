import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
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
    NewFiltersToolPanelModule,
    SideBarModule,
    ToolbarModule,
} from 'ag-grid-enterprise';

import { CustomToolbarButton } from './customToolbarItem_typescript';

ModuleRegistry.registerModules([
    TextFilterModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    CsvExportModule,
    ExcelExportModule,
    NewFiltersToolPanelModule,
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
    enableFilterHandlers: true,
    sideBar: { toolPanels: ['columns', 'filters-new'] },
    toolbar: {
        alignment: 'right',
        items: [
            {
                toolbarItem: CustomToolbarButton,
                key: 'columnChooser',
                alignment: 'left',
                toolbarItemParams: {
                    label: 'Choose Columns',
                    icon: 'columns',
                    onClick: (api: GridApi) => api.showColumnChooser(),
                },
            },
            {
                toolbarItem: CustomToolbarButton,
                key: 'filtersPanel',
                alignment: 'left',
                toolbarItemParams: {
                    label: 'Filters Panel',
                    icon: 'filter',
                    onClick: (api: GridApi) =>
                        api.getOpenedToolPanel() === 'filters-new'
                            ? api.closeToolPanel()
                            : api.openToolPanel('filters-new'),
                },
            },
            {
                toolbarItem: CustomToolbarButton,
                key: 'excelExport',
                alignment: 'left',
                toolbarItemParams: {
                    label: 'Excel Export',
                    icon: 'excel',
                    onClick: (api: GridApi) => api.exportDataAsExcel(),
                },
            },
            {
                toolbarItem: CustomToolbarButton,
                key: 'autoSizeAll',
                toolbarItemParams: {
                    title: 'Auto Size All',
                    icon: 'maximize',
                    onClick: (api: GridApi) => api.autoSizeAllColumns(),
                },
            },
            {
                toolbarItem: CustomToolbarButton,
                key: 'columnsPanel',
                toolbarItemParams: {
                    title: 'Columns Panel',
                    icon: 'columns',
                    onClick: (api: GridApi) =>
                        api.getOpenedToolPanel() === 'columns' ? api.closeToolPanel() : api.openToolPanel('columns'),
                },
            },
            {
                toolbarItem: CustomToolbarButton,
                key: 'csvExport',
                toolbarItemParams: {
                    title: 'CSV Export',
                    icon: 'csv',
                    onClick: (api: GridApi) => api.exportDataAsCsv(),
                },
            },
            {
                toolbarItem: CustomToolbarButton,
                key: 'resetColumns',
                toolbarItemParams: {
                    title: 'Reset Columns',
                    icon: 'minimize',
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
