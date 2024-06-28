import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GetMainMenuItemsParams, GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';

import { MenuItem } from './menuItem_typescript';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ClipboardModule,
    ExcelExportModule,
    MenuModule,
    RangeSelectionModule,
]);

const columnDefs: ColDef[] = [
    { field: 'athlete' },
    { field: 'country' },
    { field: 'sport' },
    { field: 'year' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
        suppressHeaderFilterButton: true,
    },
    columnDefs: columnDefs,
    rowData: null,
    getMainMenuItems: (params: GetMainMenuItemsParams) => {
        return [
            ...params.defaultItems.filter((item) => item !== 'columnFilter'),
            'separator',
            {
                name: 'Filter',
                menuItem: MenuItem,
                menuItemParams: {
                    column: params.column,
                },
            },
        ];
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data) => {
            gridApi!.setGridOption('rowData', data);
        });
});
