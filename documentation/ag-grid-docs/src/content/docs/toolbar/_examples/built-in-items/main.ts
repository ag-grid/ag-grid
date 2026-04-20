import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { FindModule, RowGroupingModule, RowGroupingPanelModule, ToolbarModule } from 'ag-grid-enterprise';

import { CustomToolbarButton } from './customToolbarItem_typescript';

ModuleRegistry.registerModules([
    TextFilterModule,
    NumberFilterModule,
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
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
        items: [
            'rowGroupPanel',
            { toolbarItem: 'find', alignment: 'right' },
            {
                toolbarItem: CustomToolbarButton,
                key: 'autoSizeAll',
                alignment: 'right',
                toolbarItemParams: {
                    label: 'Auto Size All',
                    icon: 'maximize',
                    onClick: (api: GridApi) => api.autoSizeAllColumns(),
                },
            },
            {
                toolbarItem: CustomToolbarButton,
                key: 'resetColumns',
                alignment: 'right',
                toolbarItemParams: {
                    label: 'Reset Columns',
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
