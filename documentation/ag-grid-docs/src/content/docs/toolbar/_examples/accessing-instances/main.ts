import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { ColumnsToolPanelModule, NewFiltersToolPanelModule, SideBarModule, ToolbarModule } from 'ag-grid-enterprise';

import { CustomPanelToggle } from './customToolbarItem_typescript';

ModuleRegistry.registerModules([
    TextFilterModule,
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
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
        items: [
            {
                toolbarItem: CustomPanelToggle,
                key: 'columnsPanel',
                toolbarItemParams: {
                    label: 'Columns',
                    icon: 'columns',
                    panelId: 'columns',
                },
            },
            {
                toolbarItem: CustomPanelToggle,
                key: 'filtersPanel',
                toolbarItemParams: {
                    label: 'Filters',
                    icon: 'filter',
                    panelId: 'filters-new',
                },
            },
        ],
    },
};

function toggleColumnsPanel() {
    gridApi.getToolbarItemInstance<CustomPanelToggle>('columnsPanel')?.toggle();
}

function toggleFiltersPanel() {
    gridApi.getToolbarItemInstance<CustomPanelToggle>('filtersPanel')?.toggle();
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
