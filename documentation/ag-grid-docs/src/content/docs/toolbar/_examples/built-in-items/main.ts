import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CsvExportModule,
    ModuleRegistry,
    NumberFilterModule,
    QuickFilterModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { ContextMenuModule, ExcelExportModule, ToolbarModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    TextFilterModule,
    NumberFilterModule,
    ClientSideRowModelModule,
    ContextMenuModule,
    CsvExportModule,
    ExcelExportModule,
    QuickFilterModule,
    ToolbarModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete' },
        { field: 'country' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ],
    defaultColDef: {
        minWidth: 100,
        filter: true,
    },
    toolbar: {
        items: [
            // Built in Quick Filter
            'agQuickFilterToolbarItem',
            // Action Button to re-size the columns
            {
                label: 'Fit Columns To Grid',
                icon: 'maximize',
                alignment: 'right',
                action: (params) => params.api.sizeColumnsToFit(),
            },
            // Menu Item for exporting to CSV / Excel
            {
                toolbarItem: 'agMenuToolbarItem',
                icon: 'save',
                alignment: 'right',
                tooltip: 'Export to Csv / Excel',
                toolbarItemParams: {
                    menuItems: ['csvExport', 'excelExport'],
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
