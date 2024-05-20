import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    MenuModule,
    RowGroupingModule,
    SetFilterModule,
]);

const columnDefs: ColDef[] = [
    { field: 'country', width: 120, rowGroup: true, hide: true },
    { field: 'year', width: 90, rowGroup: true, hide: true },
    { field: 'athlete', width: 200 },
    { field: 'age', width: 90 },
    { field: 'sport', width: 110 },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    autoGroupColumnDef: {
        headerTooltip: 'Group',
        minWidth: 190,
        tooltipValueGetter: (params) => {
            const count = params.node && params.node.allChildrenCount;

            if (count != null) {
                return 'Tooltip text - ' + params.value + ' (' + count + ')';
            }

            return params.value;
        },
    },
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    tooltipShowDelay: 500,
    columnDefs: columnDefs,
    rowData: null,
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
