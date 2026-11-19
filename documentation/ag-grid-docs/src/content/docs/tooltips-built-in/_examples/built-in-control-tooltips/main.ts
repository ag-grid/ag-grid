import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    PaginationModule,
    TextFilterModule,
    TooltipModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnMenuModule, ColumnsToolPanelModule } from 'ag-grid-enterprise';

import { CustomBuiltInTooltip } from './customBuiltInTooltip_typescript';

if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    PaginationModule,
    TextFilterModule,
    TooltipModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [{ field: 'athlete', filter: 'agTextColumnFilter' }, { field: 'country' }, { field: 'sport' }],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        tooltip: true,
        headerTooltip: true,
    },
    rowData: [
        { athlete: 'Michael Phelps', country: 'United States', sport: 'Swimming' },
        { athlete: 'Simone Biles', country: 'United States', sport: 'Gymnastics' },
        { athlete: 'Katie Ledecky', country: 'United States', sport: 'Swimming' },
        { athlete: 'Usain Bolt', country: 'Jamaica', sport: 'Athletics' },
        { athlete: 'Shelly-Ann Fraser-Pryce', country: 'Jamaica', sport: 'Athletics' },
        { athlete: 'Eliud Kipchoge', country: 'Kenya', sport: 'Athletics' },
    ],
    pagination: true,
    paginationPageSize: 3,
    paginationPageSizeSelector: false,
    sideBar: { toolPanels: ['columns'] },
    suppressMenuHide: true,
    components: { customBuiltInTooltip: CustomBuiltInTooltip },
    builtInTooltipComponent: 'customBuiltInTooltip',
    builtInTooltipComponentParams: { heading: 'Grid control' },
};

function onSuppressionChanged() {
    gridApi.setGridOption(
        'suppressBuiltInTooltips',
        document.querySelector<HTMLInputElement>('#suppressBuiltIn')!.checked
    );
}

function onCustomComponentChanged() {
    gridApi.setGridOption(
        'builtInTooltipComponent',
        document.querySelector<HTMLInputElement>('#customComponent')!.checked ? 'customBuiltInTooltip' : undefined
    );
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
