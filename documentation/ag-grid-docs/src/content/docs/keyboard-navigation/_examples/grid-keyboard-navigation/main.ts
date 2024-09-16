import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, ColGroupDef, GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    MenuModule,
    SetFilterModule,
]);

const columnDefs: (ColDef | ColGroupDef)[] = [
    {
        headerName: 'Participant',
        children: [
            { field: 'athlete', minWidth: 170 },
            { field: 'country', minWidth: 150 },
        ],
    },
    { field: 'sport' },
    {
        headerName: 'Medals',
        children: [
            {
                field: 'total',
                columnGroupShow: 'closed',
                filter: 'agNumberColumnFilter',
                width: 120,
                flex: 0,
            },
            {
                field: 'gold',
                columnGroupShow: 'open',
                filter: 'agNumberColumnFilter',
                width: 100,
                flex: 0,
            },
            {
                field: 'silver',
                columnGroupShow: 'open',
                filter: 'agNumberColumnFilter',
                width: 100,
                flex: 0,
            },
            {
                field: 'bronze',
                columnGroupShow: 'open',
                filter: 'agNumberColumnFilter',
                width: 100,
                flex: 0,
            },
        ],
    },
    { field: 'year', filter: 'agNumberColumnFilter' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    rowData: null,
    columnDefs,
    selection: {
        mode: 'multiRow',
    },
    defaultColDef: {
        editable: true,
        minWidth: 100,
        filter: true,
        floatingFilter: true,
        flex: 1,
    },
    sideBar: {
        toolPanels: ['columns', 'filters'],
        defaultToolPanel: '',
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
