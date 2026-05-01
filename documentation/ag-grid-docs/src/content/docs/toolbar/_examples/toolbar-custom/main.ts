import type { GridApi, GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, createGrid } from 'ag-grid-community';
import { ColumnsToolPanelModule, NewFiltersToolPanelModule, SideBarModule, ToolbarModule } from 'ag-grid-enterprise';

import { ToolPanelRadio } from './customToolbarItem_typescript';

ModuleRegistry.registerModules([
    AllCommunityModule,
    ColumnsToolPanelModule,
    NewFiltersToolPanelModule,
    SideBarModule,
    ToolbarModule,
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
        items: [{ toolbarItem: ToolPanelRadio, key: 'toolPanel' }],
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
