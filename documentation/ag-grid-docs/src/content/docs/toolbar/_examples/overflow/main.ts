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
            'columnChooser',
            'autoSizeAll',
            'separator',
            'rowGroupPanel',
            'pivotPanel',
            { component: 'quickFilter', alignment: 'right' },
            { component: 'find', alignment: 'right' },
            'separator',
            { component: 'columnsPanel', alignment: 'right' },
            { component: 'filtersPanel', alignment: 'right' },
            'separator',
            { component: 'export', alignment: 'right' },
            'separator',
            { component: 'resetColumns', alignment: 'right' },
            { component: OverflowMenu, key: 'overflowMenu', alignment: 'right' },
        ],
    },
};

function onWidthSliderChange(value: string) {
    document.getElementById('myGrid')!.style.maxWidth = value + 'px';
    document.getElementById('widthValue')!.textContent = value + 'px';
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
