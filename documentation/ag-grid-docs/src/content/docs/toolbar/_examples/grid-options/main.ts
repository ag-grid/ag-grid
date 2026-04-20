import type { GridApi, GridOptions, Toolbar } from 'ag-grid-community';
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
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    FindModule,
    NewFiltersToolPanelModule,
    SideBarModule,
    ToolbarModule,
} from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    TextFilterModule,
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    CsvExportModule,
    QuickFilterModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    FindModule,
    NewFiltersToolPanelModule,
    SideBarModule,
    ToolbarModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const fullToolbar: Toolbar = {
    items: [
        { toolbarItem: 'quickFilter', alignment: 'right' },
        'separator',
        { toolbarItem: 'columnChooser', alignment: 'right' },
        { toolbarItem: 'autoSizeAll', alignment: 'right' },
        'separator',
        { toolbarItem: 'columnsPanel', alignment: 'right' },
        { toolbarItem: 'filtersPanel', alignment: 'right' },
        'separator',
        { toolbarItem: 'csvExport', alignment: 'right' },
        { toolbarItem: 'excelExport', alignment: 'right' },
        'separator',
        { toolbarItem: 'resetColumns', alignment: 'right' },
    ],
};

const compactToolbar: Toolbar = {
    items: [
        { toolbarItem: 'columnChooser', alignment: 'right' },
        { toolbarItem: 'autoSizeAll', alignment: 'right' },
        'separator',
        { toolbarItem: 'columnsPanel', alignment: 'right' },
        { toolbarItem: 'filtersPanel', alignment: 'right' },
        'separator',
        { toolbarItem: 'csvExport', alignment: 'right' },
        { toolbarItem: 'excelExport', alignment: 'right' },
        'separator',
        { toolbarItem: 'resetColumns', alignment: 'right' },
    ],
};

const minimalToolbar: Toolbar = {
    items: [
        { toolbarItem: 'autoSizeAll', alignment: 'right' },
        { toolbarItem: 'resetColumns', alignment: 'right' },
        'separator',
        { toolbarItem: 'csvExport', alignment: 'right' },
        { toolbarItem: 'excelExport', alignment: 'right' },
    ],
};

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
        enableRowGroup: true,
        enablePivot: true,
    },
    enableFilterHandlers: true,
    sideBar: {
        toolPanels: ['columns', 'filters-new'],
        defaultToolPanel: '',
    },
    toolbar: fullToolbar,
};

function setFullToolbar() {
    gridApi.setGridOption('toolbar', fullToolbar);
}

function setCompactToolbar() {
    gridApi.setGridOption('toolbar', compactToolbar);
}

function setMinimalToolbar() {
    gridApi.setGridOption('toolbar', minimalToolbar);
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data));
});
