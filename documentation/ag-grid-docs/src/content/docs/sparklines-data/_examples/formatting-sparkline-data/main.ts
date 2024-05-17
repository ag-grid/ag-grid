import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { AreaSparklineOptions, GridApi, GridOptions, ValueGetterParams, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { SparklinesModule } from '@ag-grid-enterprise/sparklines';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule, SparklinesModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'symbol', maxWidth: 110 },
        { field: 'name', minWidth: 250 },
        {
            headerName: 'Rate of Change',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'area',
                } as AreaSparklineOptions,
            },
            valueGetter: (params: ValueGetterParams) => {
                const formattedData: any = [];
                const rateOfChange = params.data.rateOfChange;
                const { x, y } = rateOfChange;
                x.map((xVal: any, i: number) => formattedData.push([xVal, y[i]]));
                return formattedData;
            },
        },
        { field: 'volume', type: 'numericColumn', maxWidth: 140 },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    rowData: getData(),
    rowHeight: 50,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
