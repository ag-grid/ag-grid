import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { PivotModule, RowGroupingModule, RowGroupingPanelModule, ToolbarModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnApiModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    PivotModule,
    ToolbarModule,
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'country', enableRowGroup: true, rowGroup: true },
        { field: 'year', enableRowGroup: true, enablePivot: true, pivot: true },
        { field: 'sport', enableRowGroup: true, enablePivot: true },
        { field: 'gold', enableValue: true, aggFunc: 'sum' },
        { field: 'silver', enableValue: true, aggFunc: 'sum' },
        { field: 'total', enableValue: true, aggFunc: 'sum' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 120,
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },
    pivotMode: true,
    toolbar: {
        items: [
            'agRowGroupPanelToolbarItem',
            'separator',
            'agPivotPanelToolbarItem',
            'separator',
            {
                icon: 'columns',
                label: 'Reset',
                alignment: 'right',
                action: (params) => {
                    params.api.setGridOption('pivotMode', true);
                    params.api.resetColumnState();
                },
            },
        ],
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
