import type { GridApi, GridOptions, MenuItemDef } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    CsvExportModule,
    ModuleRegistry,
    QuickFilterModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { ColumnMenuModule, ExcelExportModule, FindModule, ToolbarModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    TextFilterModule,
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    CsvExportModule,
    QuickFilterModule,
    ColumnMenuModule,
    ExcelExportModule,
    FindModule,
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
    toolbar: {
        items: [
            'find',
            { toolbarItem: 'autoSizeAll', alignment: 'right' },
            'separator',
            {
                toolbarItem: 'menu',
                alignment: 'right',
                toolbarItemParams: {
                    label: 'Export',
                    icon: 'save',
                    menuItems: [
                        { name: 'CSV Export', icon: 'csvExport', action: (params) => params.api.exportDataAsCsv() },
                        {
                            name: 'Excel Export',
                            icon: 'excelExport',
                            action: (params) => params.api.exportDataAsExcel(),
                        },
                    ] as MenuItemDef[],
                },
            },
            'separator',
            { toolbarItem: 'resetColumns', alignment: 'right', display: 'iconAndLabel' },
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
