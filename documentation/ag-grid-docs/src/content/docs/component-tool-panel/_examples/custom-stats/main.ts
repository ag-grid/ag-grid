import type { CellValueChangedEvent, ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    EventApiModule,
    ModuleRegistry,
    NumberEditorModule,
    NumberFilterModule,
    RowApiModule,
    TextEditorModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
    iconOverrides,
    themeQuartz,
} from 'ag-grid-community';
import { ColumnsToolPanelModule, FiltersToolPanelModule, SetFilterModule } from 'ag-grid-enterprise';

import { CustomStatsToolPanel } from './customStatsToolPanel_typescript';

ModuleRegistry.registerModules([
    ClientSideRowModelApiModule,
    NumberEditorModule,
    TextEditorModule,
    NumberFilterModule,
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    SetFilterModule,
    TextFilterModule,
    RowApiModule,
    EventApiModule,
    ValidationModule /* Development Only */,
]);

const columnDefs: ColDef[] = [
    { field: 'athlete', width: 150, filter: 'agTextColumnFilter' },
    { field: 'age', width: 90 },
    { field: 'country', width: 120 },
    { field: 'year', width: 90 },
    { field: 'date', width: 110 },
    { field: 'gold', width: 100, filter: false },
    { field: 'silver', width: 100, filter: false },
    { field: 'bronze', width: 100, filter: false },
    { field: 'total', width: 100, filter: false },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    theme: themeQuartz.withPart(
        iconOverrides({
            type: 'image',
            mask: true,
            icons: {
                // map of icon names to images
                'custom-stats': {
                    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><g stroke="#7F8C8D" fill="none" fill-rule="evenodd"><path d="M10.5 6V4.5h-5v.532a1 1 0 0 0 .36.768l1.718 1.432a1 1 0 0 1 0 1.536L5.86 10.2a1 1 0 0 0-.36.768v.532h5V10"/><rect x="1.5" y="1.5" width="13" height="13" rx="2"/></g></svg>',
                },
            },
        })
    ),
    defaultColDef: {
        editable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
    },
    icons: {
        'custom-stats': '<span class="ag-icon ag-icon-custom-stats"></span>',
    },
    columnDefs: columnDefs,
    sideBar: {
        toolPanels: [
            {
                id: 'columns',
                labelDefault: 'Columns',
                labelKey: 'columns',
                iconKey: 'columns',
                toolPanel: 'agColumnsToolPanel',
            },
            {
                id: 'filters',
                labelDefault: 'Filters',
                labelKey: 'filters',
                iconKey: 'filter',
                toolPanel: 'agFiltersToolPanel',
            },
            {
                id: 'customStats',
                labelDefault: 'Custom Stats',
                labelKey: 'customStats',
                iconKey: 'custom-stats',
                toolPanel: CustomStatsToolPanel,
                toolPanelParams: {
                    title: 'Custom Stats',
                },
            },
        ],
        defaultToolPanel: 'customStats',
    },
    onCellValueChanged: (params: CellValueChangedEvent) => {
        params.api.refreshClientSideRowModel();
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
