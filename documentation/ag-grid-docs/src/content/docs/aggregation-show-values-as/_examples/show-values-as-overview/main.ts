import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    RowGroupingModule,
    ShowValuesAsModule,
} from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextFilterModule,
    NumberFilterModule,
    ColumnMenuModule,
    ContextMenuModule,
    ColumnsToolPanelModule,
    RowGroupingModule,
    ShowValuesAsModule,
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true, enableRowGroup: true },
        { field: 'year', rowGroup: true, hide: true, enableRowGroup: true },
        { field: 'athlete' },
        {
            field: 'total',
            headerName: 'Total',
            aggFunc: 'sum',
            enableValue: true,
            enableShowValuesAs: true,
        },
        {
            field: 'total',
            colId: 'totalPercentOfParent',
            headerName: 'Total of Parent',
            aggFunc: 'sum',
            showValuesAs: 'percentOfParentRowTotal',
            enableValue: true,
            enableShowValuesAs: true,
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 130,
    },
    autoGroupColumnDef: {
        minWidth: 220,
    },
    groupDefaultExpanded: 1,
    grandTotalRow: 'top',
    isGroupOpenByDefault: (params) => {
        const route = params.rowNode.getRoute();
        const destPath = ['United States', '2008'];
        return route.every((item, idx) => destPath[idx] === item);
    },
    suppressAggFuncInHeader: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
