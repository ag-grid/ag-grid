import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { AreaSparklineOptions, GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import { SparklinesModule } from '@ag-grid-enterprise/sparklines';

import { getStockData } from './data';

ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule, SparklinesModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'symbol', maxWidth: 110 },
        { field: 'name', minWidth: 250 },
        {
            field: 'rateOfChange',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'area',
                } as AreaSparklineOptions,
            },
        },
        { field: 'volume', type: 'numericColumn', maxWidth: 140 },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    rowData: getStockData(),
    rowHeight: 50,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
