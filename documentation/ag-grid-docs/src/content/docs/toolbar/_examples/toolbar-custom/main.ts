import type { GridApi, GridOptions, ToolPanelVisibleChangedEvent } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, createGrid } from 'ag-grid-community';
import { ColumnsToolPanelModule, FiltersToolPanelModule, SideBarModule, ToolbarModule } from 'ag-grid-enterprise';

import { ToolPanelRadio, WinnersToggle } from './customToolbarItem_typescript';

ModuleRegistry.registerModules([
    AllCommunityModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    SideBarModule,
    ToolbarModule,
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete' },
        { field: 'country' },
        { field: 'gold', filter: 'agNumberColumnFilter' },
        { field: 'silver', filter: 'agNumberColumnFilter' },
        { field: 'bronze' },
    ],
    defaultColDef: {
        minWidth: 100,
        filter: true,
    },
    sideBar: { toolPanels: ['columns', 'filters'] },
    toolbar: {
        items: [
            { toolbarItem: WinnersToggle, key: 'winners' },
            { toolbarItem: ToolPanelRadio, key: 'toolPanel', alignment: 'right' },
        ],
    },
    onToolPanelVisibleChanged: (event: ToolPanelVisibleChangedEvent) => {
        const radio = event.api.getToolbarItemInstance<ToolPanelRadio>('toolPanel');
        radio?.setSelected(event.visible ? event.key : 'none');
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
