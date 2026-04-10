import type { GridApi, GridOptions } from 'ag-grid-community';
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
    PivotModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    SideBarModule,
    ToolbarModule,
} from 'ag-grid-enterprise';

import { OverflowMenu } from './overflowMenu_typescript';

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
    PivotModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    SideBarModule,
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
        { field: 'gold', enableValue: true },
        { field: 'silver', enableValue: true },
        { field: 'bronze', enableValue: true },
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
    toolbar: {
        items: [
            'rowGroupPanel',
            'pivotPanel',
            'separator',
            'columnChooser',
            'autoSizeAll',
            { toolbarItem: 'quickFilter', alignment: 'right' },
            { toolbarItem: 'find', alignment: 'right' },
            'separator',
            { toolbarItem: 'columnsPanel', alignment: 'right' },
            { toolbarItem: 'filtersPanel', alignment: 'right' },
            'separator',
            { toolbarItem: 'export', alignment: 'right' },
            'separator',
            { toolbarItem: 'resetColumns', alignment: 'right' },
            { toolbarItem: OverflowMenu, key: 'overflowMenu', alignment: 'right' },
        ],
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    document.getElementById('widthSlider')!.addEventListener('input', (e) => {
        const value = (e.target as HTMLInputElement).value;
        const grid = document.getElementById('myGrid');
        const label = document.getElementById('widthValue');
        if (grid) grid.style.maxWidth = value + '%';
        if (label) label.textContent = value + '%';
    });

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
