import type { AgSparklineOptions } from 'ag-charts-community';
import { AgChartsCommunityModule } from 'ag-charts-community';

import type { GridApi, GridOptions, ValueGetterParams } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ClipboardModule, ContextMenuModule, SparklinesModule } from 'ag-grid-enterprise';

import { getData } from './data';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    SparklinesModule.with(AgChartsCommunityModule),
    ClipboardModule,
    ContextMenuModule,
]);

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
                } as AgSparklineOptions,
            },
            valueGetter: (params: ValueGetterParams) => {
                const formattedData: any = [];
                const rateOfChange = params.data.rateOfChange;
                const { x, y } = rateOfChange;
                x.map((xVal: any, i: number) => formattedData.push([xVal, y[i]]));
                return formattedData;
            },
        },
        { field: 'volume', maxWidth: 140 },
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
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
