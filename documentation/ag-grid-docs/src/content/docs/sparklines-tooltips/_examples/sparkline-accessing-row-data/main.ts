import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, LineSparklineOptions, TooltipRendererParams, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import { SparklinesModule } from '@ag-grid-enterprise/sparklines';

import { getData } from './data';

ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule, SparklinesModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'symbol', maxWidth: 120 },
        { field: 'name', minWidth: 250 },
        {
            field: 'change',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    tooltip: {
                        renderer: tooltipRenderer,
                    },
                } as LineSparklineOptions,
            },
        },
        {
            field: 'volume',
            type: 'numericColumn',
            maxWidth: 140,
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    rowData: getData(),
    rowHeight: 50,
};

function tooltipRenderer(params: TooltipRendererParams) {
    return {
        title: params.context.data.symbol,
    };
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
