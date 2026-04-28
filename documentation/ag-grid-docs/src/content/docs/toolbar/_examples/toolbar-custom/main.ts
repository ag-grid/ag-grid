import type { GridApi, GridOptions, ToolbarItemActionParams } from 'ag-grid-community';
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

import { CustomToolbarToggle } from './customToolbarItem_typescript';
import './style.css';

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
                key: 'columnChooser',
                alignment: 'left',
                label: 'Choose Columns',
                icon: 'columns',
                action: ({ api }: ToolbarItemActionParams) => api.showColumnChooser(),
            },
            {
                toolbarItem: CustomToolbarToggle,
                key: 'filtersPanel',
                alignment: 'left',
                toolbarItemParams: {
                    label: 'Filters Panel',
                    icon: 'filter',
                    panelId: 'filters-new',
                    onClick: (api: GridApi) =>
                        api.getOpenedToolPanel() === 'filters-new'
                            ? api.closeToolPanel()
                            : api.openToolPanel('filters-new'),
                },
            },
            {
                toolbarItem: CustomToolbarToggle,
                key: 'columnsPanel',
                alignment: 'left',
                toolbarItemParams: {
                    label: 'Columns Panel',
                    icon: 'columns',
                    panelId: 'columns',
                    onClick: (api: GridApi) =>
                        api.getOpenedToolPanel() === 'columns' ? api.closeToolPanel() : api.openToolPanel('columns'),
                },
            },
            {
                key: 'autoSizeAll',
                action: ({ api }: ToolbarItemActionParams) => api.autoSizeAllColumns(),
                tooltip: 'Auto Size All',
                icon: 'maximize',
            },
            {
                key: 'csvExport',
                tooltip: 'CSV Export',
                icon: 'csvExport',
                action: ({ api }: ToolbarItemActionParams) => api.exportDataAsCsv(),
            },
            {
                key: 'resetColumns',
                tooltip: 'Reset Columns',
                icon: 'minimize',
                action: ({ api }: ToolbarItemActionParams) => api.resetColumnState(),
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
