import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    CsvExportModule,
    ModuleRegistry,
    NumberFilterModule,
    QuickFilterModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ContextMenuModule, ExcelExportModule, FindModule, ToolbarModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    TextFilterModule,
    NumberFilterModule,
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    ContextMenuModule,
    CsvExportModule,
    ExcelExportModule,
    FindModule,
    QuickFilterModule,
    ToolbarModule,
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
            'agQuickFilterToolbarItem',
            'separator',
            'agFindToolbarItem',
            'separator',
            {
                label: 'Fit Columns To Grid',
                icon: 'maximize',
                alignment: 'right',
                action: (params) => params.api.sizeColumnsToFit(),
            },
            {
                toolbarItem: 'agMenuToolbarItem',
                icon: 'save',
                alignment: 'right',
                label: 'Export',
                tooltip: 'Export as CSV or Excel',
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
