import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ColumnMenuModule, RowGroupingModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnMenuModule, RowGroupingModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'bronze', aggFunc: 'sum' },
        { field: 'silver', aggFunc: 'avg' },
        { field: 'gold', aggFunc: 'custom_Mode' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },
    grandTotalRow: 'bottom',
    groupTotalRow: 'bottom',
    aggFuncs: {
        custom_Mode: (params) => {
            const counts = new Map<number, number>();
            let mode = null;
            let maxCount = 0;
            for (const value of params.values) {
                if (value == null) continue;
                const count = (counts.get(value) ?? 0) + 1;
                counts.set(value, count);
                if (count > maxCount) {
                    maxCount = count;
                    mode = value;
                }
            }
            return mode;
        },
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
