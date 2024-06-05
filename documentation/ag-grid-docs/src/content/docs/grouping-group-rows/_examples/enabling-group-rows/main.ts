import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, ICellRendererParams, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule, RowGroupingModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        {
            field: 'athlete',
            minWidth: 250,
            cellRenderer: (params: ICellRendererParams) => {
                return `<span style="margin-left: 60px">${params.value}</span>`;
            },
        },
        { field: 'sport', minWidth: 200 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    groupDisplayType: 'groupRows',
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then(function (data) {
            gridApi!.setGridOption('rowData', data);
        });
});
