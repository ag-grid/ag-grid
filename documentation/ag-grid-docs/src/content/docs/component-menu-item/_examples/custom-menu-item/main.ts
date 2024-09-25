import { ClientSideRowModelModule } from 'ag-grid-community';
import {
    ColDef,
    GetContextMenuItemsParams,
    GetMainMenuItemsParams,
    GridApi,
    GridOptions,
    createGrid,
} from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ClipboardModule } from 'ag-grid-enterprise';
import { ExcelExportModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { RangeSelectionModule } from 'ag-grid-enterprise';

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
    },
    columnDefs: columnDefs,
    rowData: null,
    getMainMenuItems: (params: GetMainMenuItemsParams) => {
        return [
            ...params.defaultItems,
            'separator',
            {
                name: 'Click Alert Button and Close Menu',
                menuItem: MenuItem,
                menuItemParams: {
                    buttonValue: 'Alert',
                },
            },
            {
                name: 'Click Alert Button and Keep Menu Open',
                suppressCloseOnSelect: true,
                menuItem: MenuItem,
                menuItemParams: {
                    buttonValue: 'Alert',
                },
            },
        ];
    },
    getContextMenuItems: (params: GetContextMenuItemsParams) => {
        return [
            ...(params.defaultItems || []),
            'separator',
            {
                name: 'Click Alert Button and Close Menu',
                menuItem: MenuItem,
                menuItemParams: {
                    buttonValue: 'Alert',
                },
            },
            {
                name: 'Click Alert Button and Keep Menu Open',
                suppressCloseOnSelect: true,
                menuItem: MenuItem,
                menuItemParams: {
                    buttonValue: 'Alert',
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
